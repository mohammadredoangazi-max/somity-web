export async function onRequestPost(context) {
    const { env } = context;
    
    if (!env.DB) {
        return new Response(JSON.stringify({ success: false, message: "ডেটাবেজ কানেকশন পাওয়া যায়নি।" }), {
            status: 500,
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });
    }

    try {
        const { username, password } = await context.request.json();
        const cleanUsername = username ? username.toLowerCase().trim() : "";

        // ডেটাবেজ থেকে ইউজার চেক
        const user = await env.DB.prepare("SELECT * FROM users WHERE username = ? AND password = ?")
            .bind(cleanUsername, password)
            .first();

        if (user) {
            return new Response(JSON.stringify({ 
                success: true, 
                message: "লগইন সফল হয়েছে!",
                username: user.username
            }), {
                status: 200,
                headers: { "Content-Type": "application/json; charset=UTF-8" }
            });
        } else {
            return new Response(JSON.stringify({ success: false, message: "ভুল ইউজারনেম অথবা পাসওয়ার্ড!" }), {
                status: 400,
                headers: { "Content-Type": "application/json; charset=UTF-8" }
            });
        }

    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: "সার্ভার এরর: " + error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });
    }
}
