import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Consultants table
export const consultants = pgTable('consultants', {
  consultant_id: uuid('consultant_id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  pwd: text('pwd').notNull(),
  full_name: text('full_name').notNull(),
  phone: text('phone'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Farms table
export const farms = pgTable('farms', {
  farm_id: uuid('farm_id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  owner_name: text('owner_name').notNull(),
  size: integer('size'),
  crop: text('crop'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Consulting Sessions table
export const consultingSessions = pgTable('consulting_sessions', {
  consulting_id: uuid('consulting_id').primaryKey().defaultRandom(),
  farm_id: uuid('farm_id').references(() => farms.farm_id).notNull(),
  consultant_id: uuid('consultant_id').references(() => consultants.consultant_id).notNull(),
  visit_date: timestamp('visit_date').notNull(),
  status: text('status', { enum: ['diagnosis', 'analysis', 'solution'] }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Environmental Data table
export const environmentalData = pgTable('environmental_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  farm_id: uuid('farm_id').references(() => farms.farm_id).notNull(),
  consulting_id: uuid('consulting_id').references(() => consultingSessions.consulting_id).notNull(),
  temp_daytime: integer('temp_daytime'),
  temp_nighttime: integer('temp_nighttime'),
  humidity: integer('humidity'),
  co2_level: integer('co2_level'),
  light_intensity: integer('light_intensity'),
  temp_outside: integer('temp_outside'),
  weather: text('weather', { enum: ['sunny', 'cloudy', 'rain', 'snow'] }),
  recorded_at: timestamp('recorded_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Irrigation Data table
export const irrigationData = pgTable('irrigation_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  farm_id: uuid('farm_id').references(() => farms.farm_id).notNull(),
  feed_ec: integer('feed_ec'),
  feed_ph: integer('feed_ph'),
  drain_ec: integer('drain_ec'),
  drain_ph: integer('drain_ph'),
  moisture_content: integer('moisture_content'),
  feed_amount: integer('feed_amount'),
  drain_amount: integer('drain_amount'),
  recorded_at: timestamp('recorded_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Growth Management table
export const growthManagement = pgTable('growth_management', {
  id: uuid('id').primaryKey().defaultRandom(),
  farm_id: uuid('farm_id').references(() => farms.farm_id).notNull(),
  crop_image_url: text('crop_image_url'),
  thinning_notes: text('thinning_notes'),
  growth_stage: text('growth_stage'),
  recorded_at: timestamp('recorded_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Pest Management table
export const pestManagement = pgTable('pest_management', {
  id: uuid('id').primaryKey().defaultRandom(),
  farm_id: uuid('farm_id').references(() => farms.farm_id).notNull(),
  ispest: boolean('ispest').notNull(),
  pest_type: text('pest_type'),
  pest_image_url: text('pest_image_url'),
  severity: text('severity'),
  treatment: text('treatment'),
  recorded_at: timestamp('recorded_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Financial Management table
export const financialManagement = pgTable('financial_management', {
  id: uuid('id').primaryKey().defaultRandom(),
  consulting_id: uuid('consulting_id').references(() => consultingSessions.consulting_id).notNull(),
  electricity_cost: integer('electricity_cost'),
  labor_cost: integer('labor_cost'),
  other_costs: integer('other_costs'),
  notes: text('notes'),
  recorded_at: timestamp('recorded_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Owner Interviews table
export const ownerInterviews = pgTable('owner_interviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  consulting_id: uuid('consulting_id').references(() => consultingSessions.consulting_id).notNull(),
  concerns: text('concerns'),
  questions: text('questions'),
  feedback: text('feedback'),
  recorded_at: timestamp('recorded_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Consulting Reports table
export const consultingReports = pgTable('consulting_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  consulting_id: uuid('consulting_id').references(() => consultingSessions.consulting_id).notNull(),
  diagnosis: text('diagnosis'),
  ai_recommendations: jsonb('ai_recommendations'),
  recorded_at: timestamp('recorded_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const consultantsRelations = relations(consultants, ({ many }) => ({
  consultingSessions: many(consultingSessions),
}));

export const farmsRelations = relations(farms, ({ many }) => ({
  consultingSessions: many(consultingSessions),
  environmentalData: many(environmentalData),
  irrigationData: many(irrigationData),
  growthManagement: many(growthManagement),
  pestManagement: many(pestManagement),
}));

export const consultingSessionsRelations = relations(consultingSessions, ({ one, many }) => ({
  farm: one(farms, {
    fields: [consultingSessions.farm_id],
    references: [farms.farm_id],
  }),
  consultant: one(consultants, {
    fields: [consultingSessions.consultant_id],
    references: [consultants.consultant_id],
  }),
  environmentalData: many(environmentalData),
  financialManagement: many(financialManagement),
  ownerInterviews: many(ownerInterviews),
  consultingReports: many(consultingReports),
})); 