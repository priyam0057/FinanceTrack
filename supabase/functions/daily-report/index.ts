// Follow this setup guide to deploy: https://supabase.com/docs/guides/functions/deploy
// deno-lint-ignore-file

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserSetting {
    user_id: string;
    email_recipient: string;
    daily_report_enabled: boolean;
    // Removed SMTP fields
}

interface Expense {
    amount: number;
    type: string;
    note: string;
    category_id: string;
}

interface Task {
    title: string;
    priority: string;
    status: string;
}

interface ProjectUpdate {
    content: string;
    date: string;
}

// @ts-ignore
Deno.serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // @ts-ignore
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        // @ts-ignore
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase Environment Variables.');
        }

        const supabaseClient = createClient(supabaseUrl, supabaseKey)

        // 0. Parse Body for Test Mode
        let targetUserId: string | null = null;
        try {
            const body = await req.json();
            if (body && body.userId) {
                targetUserId = body.userId;
            }
        } catch (e) {
            // No body or invalid json, ignore
        }

        // 1. Fetch Users
        let query = supabaseClient.from('user_settings').select('*');
        
        if (targetUserId) {
            // Test Mode: Fetch specific user, ignore enabled flag
            query = query.eq('user_id', targetUserId);
        } else {
            // Cron Mode: Fetch only enabled users
            query = query.eq('daily_report_enabled', true);
        }

        const { data: settingsData, error: settingsError } = await query;

        if (settingsError) throw settingsError;

        const settings = settingsData as UserSetting[];
        const results: { userId: string; status: string; error?: string }[] = [];

        for (const setting of settings) {
            if (!setting.email_recipient) continue;

            // 2. Fetch User's Data
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];

            // A. Expenses (Yesterday)
            const { data: expensesData, error: expensesError } = await supabaseClient
                .from('transactions')
                .select('amount, type, note')
                .eq('user_id', setting.user_id)
                .eq('type', 'expense')
                .gte('date_time', yesterdayStr + 'T00:00:00')
                .lt('date_time', todayStr + 'T00:00:00');

            if (expensesError) {
                console.error(`Expenses query error for user ${setting.user_id}:`, expensesError);
                results.push({ userId: setting.user_id, status: 'failed', error: `Expenses query failed: ${expensesError.message}` });
                continue;
            }

            const expenses = (expensesData || []) as Expense[];
            const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

            // B. Tasks (Due/Todo Today)
            // First, get the projects owned by this user
            const { data: userProjects, error: projectsError } = await supabaseClient
                .from('projects')
                .select('id')
                .eq('user_id', setting.user_id);

            if (projectsError) {
                console.error(`Projects query error for user ${setting.user_id}:`, projectsError);
                // Continue with empty tasks instead of failing
                var tasks = [] as Task[];
            } else {
                // Extract project IDs
                const projectIds = userProjects.map((project: any) => project.id);

                // If user has no projects, continue with empty tasks
                let tasksData: any[] = [];
                let tasksError: any = null;

                if (projectIds.length > 0) {
                    // Get tasks for those projects
                    const taskResponse = await supabaseClient
                        .from('tasks')
                        .select('title, priority, status')
                        .in('project_id', projectIds)
                        .eq('status', 'todo')
                        .limit(10);

                    tasksData = taskResponse.data || [];
                    tasksError = taskResponse.error;
                }
                
                if (tasksError) {
                    console.error(`Tasks query error for user ${setting.user_id}:`, tasksError);
                    // Continue with empty tasks instead of failing
                    var tasks = [] as Task[];
                } else {
                    var tasks = tasksData as Task[];
                }
            }

            // C. Project Updates (Recent - Last 24h)
            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
            
            // Check if project_updates table exists before querying
            const { data: updatesData, error: updatesError } = await supabaseClient
                .from('project_updates')
                .select('content, date')
                .eq('user_id', setting.user_id)
                .gte('created_at', twentyFourHoursAgo.toISOString())
                .limit(5)
                .throwOnError(); // This will help us catch the error properly

            if (updatesError) {
                // Log the error but don't fail the entire function
                console.warn(`Project updates query error for user ${setting.user_id}:`, updatesError);
                // Continue with empty updates array
                var updates = [] as ProjectUpdate[];
            } else {
                var updates = (updatesData || []) as ProjectUpdate[];
            }

            // 3. Format Email
            const emailBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Daily Report: ${todayStr}</h1>
            
            <div style="margin-bottom: 24px;">
                <h2 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Finance Summary (Yesterday)</h2>
                <p style="font-size: 1.1em;">Total Spent: <strong>₹${totalExpense.toFixed(2)}</strong></p>
                <ul style="color: #4b5563;">
                ${expenses.length > 0 
                    ? expenses.map(e => `<li>${e.note || 'Expense'}: ₹${Number(e.amount).toFixed(2)}</li>`).join('') 
                    : '<li>No expenses recorded.</li>'}
                </ul>
            </div>

            <div style="margin-bottom: 24px;">
                <h2 style="color: #16a34a; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Dev Focus (Today)</h2>
                <ul style="color: #4b5563;">
                ${tasks.length > 0 
                    ? tasks.map(t => `<li>[${t.priority}] ${t.title}</li>`).join('') 
                    : '<li>No pending tasks found.</li>'}
                </ul>
            </div>

            <div style="margin-bottom: 24px;">
                <h2 style="color: #9333ea; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Recent Project Updates</h2>
                <ul style="color: #4b5563;">
                 ${updates.length > 0 
                    ? updates.map(u => `<li>${u.content} <span style="font-size:0.8em; color:#888;">(${u.date})</span></li>`).join('') 
                    : '<li>No recent updates.</li>'}
                </ul>
            </div>

            <p style="font-size: 0.9em; color: #888; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
                Sent via Builder Vibe Daily Reporter
            </p>
        </div>
      `;

            // 4. Send Email via Resend API
            try {
                // Check if user has email recipient configured
                if (!setting.email_recipient) {
                    results.push({ 
                        userId: setting.user_id, 
                        status: 'failed', 
                        error: 'Email recipient not configured. Please set your email in settings.' 
                    });
                    continue;
                }

                // Use Resend API for email delivery
                const resendApiKey = 're_Tj9FroY9_C4Aco6MiJ89tfMB3AbpyNnxF'; // Your provided key
                
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${resendApiKey}`
                    },
                    body: JSON.stringify({
                        from: 'onboarding@resend.dev', // Resend's default sender
                        to: setting.email_recipient,
                        subject: `Daily Report: ${todayStr} ${targetUserId ? '(Test)' : ''}`,
                        html: emailBody,
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
                }

                results.push({ userId: setting.user_id, status: 'sent' });
            } catch (emailError: any) {
                console.error(`Email sending error for user ${setting.user_id}:`, emailError);
                results.push({ userId: setting.user_id, status: 'failed', error: emailError.message });
            }
        }

        return new Response(
            JSON.stringify(results),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('General error in daily-report function:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})