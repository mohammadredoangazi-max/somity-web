export async function onRequestGet(context) {
    const { env } = context;
    try {
        // ডেটাবেজ থেকে সব ইউজার তুলে আনবে
        const users = await env.DB.prepare("SELECT * FROM users").all();
        
        // সব ডেটা একসাথে অ্যাডমিন প্যানেলে পাঠিয়ে দেবে
        return new Response(JSON.stringify({ 
            success: true, 
            users: users.results,
            totalFund: 0, // পরে এখানে ডেটাবেজ ক্যালকুলেশন বসাবো
            totalLoan: 0
        }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500 });
    }
}
