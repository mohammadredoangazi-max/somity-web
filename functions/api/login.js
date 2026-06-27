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

        // ইউজারনেম ও পাসওয়ার্ড ম্যাচ করানো
        const user = await env.DB.prepare("SELECT * FROM users WHERE username = ? AND password = ?")
            .bind(username, password)
            .first();

        if (!user) {
            return new Response(JSON.stringify({ success: false, message: "ইউজারনেম বা পাসওয়ার্ড ভুল হয়েছে!" }), {
                status: 401,
                headers: { "Content-Type": "application/json; charset=UTF-8" }
            });
        }

        return new Response(JSON.stringify({ success: true, role: user.role, name: user.name }), {
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
