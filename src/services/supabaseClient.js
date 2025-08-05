import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://qdohfnwvrnyotnxaehda.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkb2hmbnd2cm55b3RueGFlaGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzQ2OTQsImV4cCI6MjA2OTk1MDY5NH0.AC06HGujlOKt8liIhezRLmk4KLiF-LINiA8h0OO-HdI';

export const supabase = createClient(supabaseUrl, supabaseKey);
