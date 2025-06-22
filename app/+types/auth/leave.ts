import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";

export type Route = {
  LoaderArgs: LoaderFunctionArgs;
  ActionArgs: ActionFunctionArgs;
  MetaFunction: MetaFunction;
}; 