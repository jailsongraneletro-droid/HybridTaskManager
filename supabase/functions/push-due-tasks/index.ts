// @ts-nocheck
import webpush from 'npm:web-push';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SB_URL = Deno.env.get('SB_URL') ?? '';
const SB_SERVICE_ROLE_KEY = Deno.env.get('SB_SERVICE_ROLE_KEY') ?? '';
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';

if (!SB_URL || !SB_SERVICE_ROLE_KEY || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Missing env vars for push');
}

webpush.setVapidDetails('mailto:admin@hybridtask.app', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const supabase = createClient(SB_URL, SB_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

Deno.serve(async () => {
  const nowIso = new Date().toISOString();

  const { data: columns } = await supabase
    .from('kanban_columns')
    .select('id,title,user_id');

  const doneByUser = new Map<string, Set<string>>();
  (columns || []).forEach((c: any) => {
    const title = (c.title || '').toLowerCase();
    if (/conclu|done/.test(title)) {
      if (!doneByUser.has(c.user_id)) doneByUser.set(c.user_id, new Set());
      doneByUser.get(c.user_id)!.add(c.id);
    }
  });

  const { data: tasks } = await supabase
    .from('kanban_tasks')
    .select('id,title,due_date,status,user_id')
    .lte('due_date', nowIso)
    .is('deleted_at', null);

  const { data: sent } = await supabase
    .from('kanban_task_notifications')
    .select('task_id');

  const sentSet = new Set((sent || []).map((s: any) => s.task_id));

  const dueTasks = (tasks || []).filter((t: any) => {
    const doneSet = doneByUser.get(t.user_id);
    if (doneSet && doneSet.has(t.status)) return false;
    return !sentSet.has(t.id);
  });

  if (dueTasks.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { headers: { 'Content-Type': 'application/json' } });
  }

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth');

  const subsByUser = new Map<string, any[]>();
  (subs || []).forEach((s: any) => {
    if (!subsByUser.has(s.user_id)) subsByUser.set(s.user_id, []);
    subsByUser.get(s.user_id)!.push(s);
  });

  let sentCount = 0;

  for (const task of dueTasks) {
    const userSubs = subsByUser.get(task.user_id) || [];
    for (const sub of userSubs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          },
          JSON.stringify({
            title: 'Tarefa vencida',
            body: task.title,
            url: '/#/kanban'
          })
        );
        sentCount++;
      } catch (e) {
        console.error('Push error', e);
      }
    }

    await supabase.from('kanban_task_notifications').insert({
      task_id: task.id,
      user_id: task.user_id,
      sent_at: new Date().toISOString()
    });
  }

  return new Response(JSON.stringify({ ok: true, sent: sentCount }), { headers: { 'Content-Type': 'application/json' } });
});
