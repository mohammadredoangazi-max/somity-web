export async function onRequestPost(context) {
    const { env } = context;
    
    if (!env.DB) {
        return new Response(JSON.stringify({ success: false, message: "ডেটাবেজ কানেকশন (DB Binding) পাওয়া যায়নি।" }), {
            status: 500,
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });
    }

    try {
        const { name, username, whatsapp_number, nid_number, password } = await context.request.json();

        // ইউজার আগে থেকেই আছে কি না চেক করা
        const existingUser = await env.DB.prepare("SELECT * FROM users WHERE username = ?")
            .bind(username)
            .first();

        if (existingUser) {
            return new Response(JSON.stringify({ success: false, message: "এই ইউজারনেমটি ইতিমধ্যে নিবন্ধিত!" }), {
                status: 400,
                headers: { "Content-Type": "application/json; charset=UTF-8" }
            });
        }

        // নতুন ইউজার ডেটাবেজে ইনসার্ট করা (NID সহ)
        await env.DB.prepare("INSERT INTO users (name, username, whatsapp, nid, password, role) VALUES (?, ?, ?, ?, ?, 'member')")
            .bind(name, username, whatsapp_number, nid_number, password)
            .run();

        return new Response(JSON.stringify({ success: true, message: "নিবন্ধন সফল হয়েছে!" }), {
            status: 200,
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: "সার্ভার এরর: " + error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });
    }
}
