export async function onRequestPost(context) {
    const { env } = context;
    
    if (!env.DB) {
        return new Response(JSON.stringify({ success: false, message: "ডেটাবেজ কানেকশন পাওয়া যায়নি।" }), {
            status: 500,
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });
    }

    try {
        const { name, username, whatsapp_number, nid_number, password } = await context.request.json();

        // ইউজার অলরেডি আছে কি না চেক
        const existingUser = await env.DB.prepare("SELECT * FROM users WHERE username = ?")
            .bind(username)
            .first();

        if (existingUser) {
            return new Response(JSON.stringify({ success: false, message: "এই ইউজারনেমটি ইতিমধ্যে নিবন্ধিত!" }), {
                status: 400,
                headers: { "Content-Type": "application/json; charset=UTF-8" }
            });
        }

        // সেফ মোড: শুধুমাত্র সেই ডেটাগুলোই সেভ করবে যা তোর ডেটাবেজ টেবিলে নিশ্চিতভাবে আছে (name, username, password, role)
        // এতে করে NID বা Whatsapp কলাম না থাকলেও SQL এরর আসবে না, মেম্বার তৈরি হয়ে যাবে।
        await env.DB.prepare("INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, 'member')")
            .bind(name, username, password)
            .run();

        return new Response(JSON.stringify({ success: true, message: "নিবন্ধন সফল হয়েছে! (কলাম সীমাবদ্ধতার কারণে শুধু মূল প্রোফাইল সংরক্ষিত হয়েছে)" }), {
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
