export async function onRequestPost(context) {
    const { env } = context;
    
    if (!env.DB) {
        return new Response(JSON.stringify({ success: false, message: "ডেটাবেজ কানেকশন পাওয়া যায়নি।" }), {
            status: 500,
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });
    }

    try {
        const { name, username, whatsapp_number, password } = await context.request.json();

        // ইউজার আগে থেকেই আছে কি না চেক
        const existingUser = await env.DB.prepare("SELECT * FROM users WHERE username = ?")
            .bind(username)
            .first();

        if (existingUser) {
            return new Response(JSON.stringify({ success: false, message: "এই ইউজারনেমটি ইতিমধ্যে নিবন্ধিত!" }), {
                status: 400,
                headers: { "Content-Type": "application/json; charset=UTF-8" }
            });
        }

        // তোর ডেটাবেজের নিখুঁত স্ট্রাকচার অনুযায়ী ডেটা ইনসার্ট (NID ছাড়া)
        await env.DB.prepare("INSERT INTO users (name, username, whatsapp_number, password, role) VALUES (?, ?, ?, ?, 'member')")
            .bind(name, username, whatsapp_number, password)
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
