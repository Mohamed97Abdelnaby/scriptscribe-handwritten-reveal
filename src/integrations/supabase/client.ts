
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = "https://jasjrbplyqvwngescmql.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphc2pyYnBseXF2d25nZXNjbXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODU2NzYsImV4cCI6MjA2NTE2MTY3Nn0.alMy5dJ3eE9K2ofLVz2NW46lA17ByoeHROFB6Jtln8k"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
