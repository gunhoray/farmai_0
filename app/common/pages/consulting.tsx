import type { Route } from "../../+types/consulting";
import { useParams } from "react-router";
import Navigation from "~/common/components/navagation";
import { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Loader2, ChevronDown } from "lucide-react";
import { getFarmById } from "~/services/farm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/common/components/ui/pagination";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/common/components/ui/collapsible";
import { getConsultingPrompt } from "~/common/prompts/consul_prompt";
import { getQuestionPrompt } from "~/common/prompts/question_prompt";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/common/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export async function loader({ params }: Route.LoaderArgs) {
  const farmId = params.farmId;
  if (!farmId) {
    throw new Error("Farm ID is required");
  }
  const farm = await getFarmById(farmId);
  return { farm };
}

export function action() {
  return {};
}

export function meta() {
  return [
    { title: "Farm Consulting - FarmAI" },
    { name: "description", content: "AI-powered farm consulting and analysis" },
  ];
}

export default function Consulting({ loaderData }: Route.ComponentProps) {
  const { farm } = loaderData;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [consultingDate, setConsultingDate] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [requests, setRequests] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [solution, setSolution] = useState("");
  const [summary, setSummary] = useState("");
  const [isDiagnosisLoading, setIsDiagnosisLoading] = useState(false);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isSolutionLoading, setIsSolutionLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [diagnosisAiResponse, setDiagnosisAiResponse] = useState("");
  const [requestsAiResponse, setRequestsAiResponse] = useState("");
  const [analysisAiResponse, setAnalysisAiResponse] = useState("");
  const [solutionAiResponse, setSolutionAiResponse] = useState("");
  const [summaryAiResponse, setSummaryAiResponse] = useState("");

  // 인터뷰 관련 상태
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [interviews, setInterviews] = useState<Array<{ question: string; answer: string }>>([]);

  // 컨설팅 기록 펼침/접힘 상태
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAiConsultation = async (
    prompt: string,
    setResponse: (response: string) => void,
    setIsLoading: (loading: boolean) => void
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: prompt,
            },
            {
              role: "user",
              content: "분석을 시작해주세요.",
            },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      setResponse(data.choices[0].message.content);
    } catch (error) {
      console.error("OpenAI API 호출 중 오류 발생:", error);
      alert("AI 컨설팅을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const prompts = getConsultingPrompt({
    ...farm,
    size: farm.size ? Number(farm.size) : null,
    crop: farm.crop || undefined,
  });

  const handleDiagnosisAi = () => {
    handleAiConsultation(
      prompts.diagnosis,
      setDiagnosisAiResponse,
      setIsDiagnosisLoading
    );
  };

  const handleRequestsAi = () => {
    handleAiConsultation(
      prompts.request,
      setRequestsAiResponse,
      setIsRequestsLoading
    );
  };

  const handleAnalysisAi = () => {
    handleAiConsultation(
      prompts.analysis,
      setAnalysisAiResponse,
      setIsAnalysisLoading
    );
  };

  const handleSolutionAi = () => {
    handleAiConsultation(
      prompts.solution,
      setSolutionAiResponse,
      setIsSolutionLoading
    );
  };

  const handleSummaryAi = () => {
    handleAiConsultation(
      prompts.summary,
      setSummaryAiResponse,
      setIsSummaryLoading
    );
  };

  const handleQuestionAi = async () => {
    setIsQuestionLoading(true);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: getQuestionPrompt({
                ...farm,
                size: farm.size ? Number(farm.size) : null,
                crop: farm.crop || undefined,
              }).suggestQuestions,
            },
            {
              role: "user",
              content: "질문을 추천해주세요.",
            },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const questions = data.choices[0].message.content
        .split("\n")
        .filter((line: string) => line.match(/^\d+\./))
        .map((line: string) => line.replace(/^\d+\.\s*/, ""));
      setSuggestedQuestions(questions);
    } catch (error) {
      console.error("OpenAI API 호출 중 오류 발생:", error);
      alert("질문 추천을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsQuestionLoading(false);
    }
  };

  const handleAddInterview = () => {
    if (currentQuestion && currentAnswer) {
      setInterviews([...interviews, { question: currentQuestion, answer: currentAnswer }]);
      setCurrentQuestion("");
      setCurrentAnswer("");
    }
  };

  // 환경 데이터 차트용 데이터
  const environmentalData = [
    { time: "00:00", temperature: 18, humidity: 60, co2: 700, light: 0 },
    { time: "03:00", temperature: 17, humidity: 65, co2: 750, light: 0 },
    { time: "06:00", temperature: 19, humidity: 70, co2: 800, light: 5000 },
    { time: "09:00", temperature: 23, humidity: 65, co2: 850, light: 12000 },
    { time: "12:00", temperature: 25, humidity: 60, co2: 900, light: 15000 },
    { time: "15:00", temperature: 24, humidity: 62, co2: 850, light: 13000 },
    { time: "18:00", temperature: 22, humidity: 68, co2: 800, light: 8000 },
    { time: "21:00", temperature: 20, humidity: 65, co2: 750, light: 2000 },
  ];

  // 관수 데이터 차트용 데이터
  const irrigationData = [
    { time: "00:00", supplyEC: 2.3, supplyPH: 6.1, drainEC: 2.5, drainPH: 6.3, moisture: 32 },
    { time: "03:00", supplyEC: 2.4, supplyPH: 6.2, drainEC: 2.6, drainPH: 6.3, moisture: 33 },
    { time: "06:00", supplyEC: 2.4, supplyPH: 6.2, drainEC: 2.7, drainPH: 6.4, moisture: 34 },
    { time: "09:00", supplyEC: 2.5, supplyPH: 6.2, drainEC: 2.8, drainPH: 6.4, moisture: 35 },
    { time: "12:00", supplyEC: 2.5, supplyPH: 6.2, drainEC: 2.8, drainPH: 6.4, moisture: 35 },
    { time: "15:00", supplyEC: 2.5, supplyPH: 6.2, drainEC: 2.8, drainPH: 6.4, moisture: 34 },
    { time: "18:00", supplyEC: 2.4, supplyPH: 6.2, drainEC: 2.7, drainPH: 6.3, moisture: 33 },
    { time: "21:00", supplyEC: 2.4, supplyPH: 6.1, drainEC: 2.6, drainPH: 6.3, moisture: 32 },
  ];

  if (!farm) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">농장 정보를 찾을 수 없습니다.</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Farm Data Panel */}
            <div className="bg-card rounded-lg shadow-sm p-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">농장명</div>
                  <div className="text-base">{farm.name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">농장주</div>
                  <div className="text-base">{farm.owner_name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">재배작물</div>
                  <div className="text-base">{farm.crop || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">위치</div>
                  <div className="text-base">{farm.location}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">면적</div>
                  <div className="text-base">{farm.size ? `${farm.size}㎡` : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">최근 업데이트</div>
                  <div className="text-base">{new Date(farm.updated_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Farm Data Tabs */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">농장 데이터</h2>
              <Tabs defaultValue="environmental" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="environmental">환경 데이터</TabsTrigger>
                  <TabsTrigger value="irrigation">관수 데이터</TabsTrigger>
                  <TabsTrigger value="growth">생육 데이터</TabsTrigger>
                  <TabsTrigger value="pest">병해충 데이터</TabsTrigger>
                  <TabsTrigger value="management">경영 데이터</TabsTrigger>
                </TabsList>
                <TabsContent value="environmental" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">주간 온도</div>
                      <div className="text-base">25°C</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">야간 온도</div>
                      <div className="text-base">18°C</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">습도</div>
                      <div className="text-base">65%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">CO2 농도</div>
                      <div className="text-base">800 ppm</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">조도</div>
                      <div className="text-base">15,000 lux</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">외부 온도</div>
                      <div className="text-base">22°C</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">날씨</div>
                      <div className="text-base">맑음</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">기록 시간</div>
                      <div className="text-base">2024-03-20 14:30</div>
                    </div>
                  </div>
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>환경 데이터 추이</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={environmentalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="temperature"
                              stroke="#8884d8"
                              name="온도(°C)"
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="humidity"
                              stroke="#82ca9d"
                              name="습도(%)"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="co2"
                              stroke="#ffc658"
                              name="CO2(ppm)"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="light"
                              stroke="#ff8042"
                              name="조도(lux)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="irrigation" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">공급 EC</div>
                      <div className="text-base">2.5 mS/cm</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">공급 pH</div>
                      <div className="text-base">6.2</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">배액 EC</div>
                      <div className="text-base">2.8 mS/cm</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">배액 pH</div>
                      <div className="text-base">6.4</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">수분 함량</div>
                      <div className="text-base">35%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">공급량</div>
                      <div className="text-base">2.5 L</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">배액량</div>
                      <div className="text-base">1.8 L</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">기록 시간</div>
                      <div className="text-base">2024-03-20 14:30</div>
                    </div>
                  </div>
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>관수 데이터 추이</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={irrigationData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="supplyEC"
                              stroke="#8884d8"
                              name="공급 EC"
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="drainEC"
                              stroke="#82ca9d"
                              name="배액 EC"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="supplyPH"
                              stroke="#ffc658"
                              name="공급 pH"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="drainPH"
                              stroke="#ff8042"
                              name="배액 pH"
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="moisture"
                              stroke="#0088fe"
                              name="수분 함량(%)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="growth" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">작물 이미지 1</div>
                      <div className="bg-muted rounded-lg p-2">
                        <img 
                          src="/images/test_img1.png" 
                          alt="작물 이미지 1" 
                          className="w-full h-48 object-contain rounded-lg" 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">작물 이미지 2</div>
                      <div className="bg-muted rounded-lg p-2">
                        <img 
                          src="/images/test_img2.png" 
                          alt="작물 이미지 2" 
                          className="w-full h-48 object-contain rounded-lg" 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">생육 단계</div>
                      <div className="text-base">개화기</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">기록 시간</div>
                      <div className="text-base">2024-03-20 14:30</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">솎음 작업 노트</div>
                      <div className="text-base p-2 bg-muted rounded-md">
                        상단 잎 2장 제거, 과실 솎음 작업 완료
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="pest" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">발생 병해</div>
                      <div className="text-base">흰가루병</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">발생 해충</div>
                      <div className="text-base">진딧물</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">발생 부위</div>
                      <div className="text-base">잎, 줄기</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">발생 정도</div>
                      <div className="text-base">경미</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">방제 방법</div>
                      <div className="text-base">유기농 살충제 사용</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">방제 일자</div>
                      <div className="text-base">2024-03-19</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">방제 결과</div>
                      <div className="text-base p-2 bg-muted rounded-md">
                        방제 후 병해충 발생이 감소함
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="management" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">생산량</div>
                      <div className="text-base">1,200kg</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">판매량</div>
                      <div className="text-base">1,000kg</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">판매 금액</div>
                      <div className="text-base">8,000,000원</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">생산 비용</div>
                      <div className="text-base">3,500,000원</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">순이익</div>
                      <div className="text-base">4,500,000원</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">기간</div>
                      <div className="text-base">2024년 1분기</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">특이사항</div>
                      <div className="text-base p-2 bg-muted rounded-md">
                        신규 고객 확보로 판매량 증가, 에너지 비용 절감으로 원가 감소
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Interview Panel */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">인터뷰</h2>
              <div className="space-y-6">
                {/* Question Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-muted-foreground">질문</label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-primary text-primary-foreground hover:bg-primary/50"
                      onClick={handleQuestionAi} 
                      disabled={isQuestionLoading}
                    >
                      {isQuestionLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          질문AI 분석 중...
                        </>
                      ) : (
                        "질문AI"
                      )}
                    </Button>
                  </div>
                  <textarea
                    className="w-full mt-1 px-3 py-2 border rounded-md min-h-[60px]"
                    placeholder="질문을 입력하거나 추천 질문을 선택하세요"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                  />
                  {suggestedQuestions.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {suggestedQuestions.map((question, index) => (
                        <div
                          key={index}
                          className="p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                          onClick={() => setCurrentQuestion(question)}
                        >
                          {question}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Answer Section */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">답변</label>
                  <textarea
                    className="w-full mt-1 px-3 py-2 border rounded-md min-h-[100px]"
                    placeholder="답변을 입력하세요"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                  />
                </div>

                {/* Add Interview Button */}
                <div className="flex justify-end">
                  <Button onClick={handleAddInterview} disabled={!currentQuestion || !currentAnswer}>
                    인터뷰 추가
                  </Button>
                </div>

                {/* Interview History */}
                {interviews.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">인터뷰 기록</h3>
                    {interviews.map((interview, index) => (
                      <div key={index} className="border-b pb-4">
                        <div className="font-medium mb-2">Q: {interview.question}</div>
                        <div className="text-muted-foreground">A: {interview.answer}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Consulting History Panel */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">컨설팅 기록</h2>
              <div className="space-y-6">
                {/* Test data - will be replaced with actual data */}
                <div className="space-y-6">
                  <Collapsible 
                    open={openItems['2024-03-20']} 
                    onOpenChange={() => toggleItem('2024-03-20')}
                    className="border-b pb-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm text-muted-foreground">2024-03-20</div>
                      <div className="text-sm text-muted-foreground">김기술 컨설턴트</div>
                    </div>
                    <CollapsibleTrigger className="w-full text-left">
                      <div className="flex items-center justify-between">
                        <div className="line-clamp-3">
                          현재 농장의 전반적인 상태는 양호하나, 온도 관리와 관수 시스템에 개선이 필요합니다. 
                          특히 주간 온도가 높은 편이며, 관수량 조절이 필요해 보입니다. 
                          병해충 관리와 생육 상태는 양호한 편입니다.
                        </div>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${openItems['2024-03-20'] ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <div className="font-medium">문제 상황</div>
                          <div className="text-sm text-muted-foreground">
                            딸기 과실의 당도가 낮고, 잎이 노랗게 변색되는 현상 발생
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">솔루션</div>
                          <div className="text-sm text-muted-foreground">
                            관수량 조절 및 영양제 투여량 증가, 온도 조절 범위 수정
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible 
                    open={openItems['2024-03-15']} 
                    onOpenChange={() => toggleItem('2024-03-15')}
                    className="border-b pb-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm text-muted-foreground">2024-03-15</div>
                      <div className="text-sm text-muted-foreground">이전문 컨설턴트</div>
                    </div>
                    <CollapsibleTrigger className="w-full text-left">
                      <div className="flex items-center justify-between">
                        <div className="line-clamp-3">
                          병해충 관리에 주의가 필요하며, 특히 흰가루병과 진딧물 발생이 증가하고 있습니다. 
                          환기 시스템 개선과 방제 일정 조정이 시급합니다.
                        </div>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${openItems['2024-03-15'] ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <div className="font-medium">문제 상황</div>
                          <div className="text-sm text-muted-foreground">
                            흰가루병 발생 및 진딧물 피해 증가
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">솔루션</div>
                          <div className="text-sm text-muted-foreground">
                            유기농 살충제 사용 및 환기 시스템 개선
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible 
                    open={openItems['2024-03-10']} 
                    onOpenChange={() => toggleItem('2024-03-10')}
                    className="border-b pb-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm text-muted-foreground">2024-03-10</div>
                      <div className="text-sm text-muted-foreground">박농사 컨설턴트</div>
                    </div>
                    <CollapsibleTrigger className="w-full text-left">
                      <div className="flex items-center justify-between">
                        <div className="line-clamp-3">
                          작물 생육 불균형이 발생하고 있으며, 과실 크기 편차가 커지고 있습니다. 
                          솎음 작업과 영양분 공급 일정을 조정하여 균일한 생육을 유도해야 합니다.
                        </div>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${openItems['2024-03-10'] ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <div className="font-medium">문제 상황</div>
                          <div className="text-sm text-muted-foreground">
                            작물 생육 불균형 및 과실 크기 편차 발생
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">솔루션</div>
                          <div className="text-sm text-muted-foreground">
                            솎음 작업 실시 및 영양분 공급 일정 조정
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <div className="pt-1">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>
                          1
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Consulting Panel */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">컨설팅 보고서</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">컨설팅 날짜</label>
                  <input
                    type="date"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    value={consultingDate}
                    onChange={(e) => setConsultingDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">진단사항</label>
                  <div className="flex gap-2 mb-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-primary text-primary-foreground hover:bg-primary/50"
                      onClick={handleDiagnosisAi} 
                      disabled={isDiagnosisLoading}
                    >
                      {isDiagnosisLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          진단AI 분석 중...
                        </>
                      ) : (
                        "진단AI"
                      )}
                    </Button>
                  </div>
                  <textarea
                    className="w-full mt-1 px-3 py-2 border rounded-md min-h-[100px]"
                    placeholder="현재 농장의 상태와 문제점을 진단해주세요"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                  {diagnosisAiResponse && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <div className="text-sm text-muted-foreground mb-1">AI 진단 결과</div>
                      <div className="text-sm whitespace-pre-wrap">{diagnosisAiResponse}</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">요청사항</label>
                  <div className="flex gap-2 mb-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-primary text-primary-foreground hover:bg-primary/50"
                      onClick={handleRequestsAi} 
                      disabled={isRequestsLoading}
                    >
                      {isRequestsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          요청AI 분석 중...
                        </>
                      ) : (
                        "요청AI"
                      )}
                    </Button>
                  </div>
                  <textarea
                    className="w-full mt-1 px-3 py-2 border rounded-md min-h-[100px]"
                    placeholder="농가의 요청사항을 입력해주세요"
                    value={requests}
                    onChange={(e) => setRequests(e.target.value)}
                  />
                  {requestsAiResponse && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <div className="text-sm text-muted-foreground mb-1">AI 요청사항 분석 결과</div>
                      <div className="text-sm whitespace-pre-wrap">{requestsAiResponse}</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">분석사항</label>
                  <div className="flex gap-2 mb-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-primary text-primary-foreground hover:bg-primary/50"
                      onClick={handleAnalysisAi} 
                      disabled={isAnalysisLoading}
                    >
                      {isAnalysisLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          분석AI 분석 중...
                        </>
                      ) : (
                        "분석AI"
                      )}
                    </Button>
                  </div>
                  <textarea
                    className="w-full mt-1 px-3 py-2 border rounded-md min-h-[100px]"
                    placeholder="데이터 기반 분석 결과를 입력해주세요"
                    value={analysis}
                    onChange={(e) => setAnalysis(e.target.value)}
                  />
                  {analysisAiResponse && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <div className="text-sm text-muted-foreground mb-1">AI 분석 결과</div>
                      <div className="text-sm whitespace-pre-wrap">{analysisAiResponse}</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">솔루션</label>
                  <div className="flex gap-2 mb-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-primary text-primary-foreground hover:bg-primary/50"
                      onClick={handleSolutionAi} 
                      disabled={isSolutionLoading}
                    >
                      {isSolutionLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          솔루션AI 분석 중...
                        </>
                      ) : (
                        "솔루션AI"
                      )}
                    </Button>
                  </div>
                  <textarea
                    className="w-full mt-1 px-3 py-2 border rounded-md min-h-[100px]"
                    placeholder="제안하는 해결방안을 입력해주세요"
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                  />
                  {solutionAiResponse && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <div className="text-sm text-muted-foreground mb-1">AI 솔루션 제안</div>
                      <div className="text-sm whitespace-pre-wrap">{solutionAiResponse}</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">종합 의견</label>
                  <div className="flex gap-2 mb-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-primary text-primary-foreground hover:bg-primary/50"
                      onClick={handleSummaryAi} 
                      disabled={isSummaryLoading}
                    >
                      {isSummaryLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          종합AI 분석 중...
                        </>
                      ) : (
                        "종합AI"
                      )}
                    </Button>
                  </div>
                  <textarea
                    className="w-full mt-1 px-3 py-2 border rounded-md min-h-[100px]"
                    placeholder="전체 컨설팅 내용의 종합 의견을 입력해주세요"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                  {summaryAiResponse && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <div className="text-sm text-muted-foreground mb-1">AI 종합 의견</div>
                      <div className="text-sm whitespace-pre-wrap">{summaryAiResponse}</div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => {
                    setConsultingDate("");
                    setDiagnosis("");
                    setRequests("");
                    setAnalysis("");
                    setSolution("");
                    setSummary("");
                  }}>
                    초기화
                  </Button>
                  <Button>
                    저장하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
