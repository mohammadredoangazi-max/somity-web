export async function onRequestPost(context) {
    const { env } = context;
    
    if (!env.DB) {
        return new Response(JSON.stringify({ success: false, message: "ডেটাবেজ কানেকশন পাওয়া যায়নি।" }), {
            status: 500,
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });
    }

    try {
        const body = await context.request.json();
        const name = body.name || "";
        const username = body.username ? body.username.toLowerCase().trim() : "";
        const password = body.password || "";

        if (!username || !password || !name) {
            return new Response(JSON.stringify({ success: false, message: "নাম, ইউজারনেম এবং পাসওয়ার্ড অবশ্যই দিতে হবে।" }), {
                status: 400,
                headers: { "Content-Type": "application/json; charset=UTF-8" }
            });
        }

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

        // মোট কতজন ইউজার আছে তা গুনে সিরিয়াল আইডি বের করা (১ম জন হলে ০১, ২য় জন হলে ০২)
        const countResult = await env.DB.prepare("SELECT COUNT(*) as total FROM users").first();
        const nextIdNumber = (countResult.total + 1);
        const formattedId = nextIdNumber < 10 ? "0" + nextIdNumber : "" + nextIdNumber;

        // ডেটাবেজে মেম্বার হিসেবে ডেটা ইনসার্ট করা
        // (তোর টেবিলে যে কলামগুলো ১০০% আছে শুধু সেগুলোই রাখা হয়েছে যাতে কোনো SQlite Error না আসে)
        await env.DB.prepare("INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, 'member')")
            .bind(name, username, password)
            .run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: `নিবন্ধন সফল হয়েছে! আপনার সদস্য আইডি নম্বর: #${formattedId}` 
        }), {
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
