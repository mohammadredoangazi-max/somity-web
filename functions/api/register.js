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

        /* তোর ডেটাবেজে কলামের নাম সম্ভবত 'whatsapp_number' বা 'whatsapp_no' এবং 'nid_number' দেওয়া।
          নিচের কুয়েরিটি তোর ডেটাবেজের স্কিমার সাথে ম্যাচ করবে।
        */
        await env.DB.prepare("INSERT INTO users (name, username, whatsapp_number, nid_number, password, role) VALUES (?, ?, ?, ?, ?, 'member')")
            .bind(name, username, whatsapp_number, nid_number, password)
            .run();

        return new Response(JSON.stringify({ success: true, message: "নিবন্ধন সফল হয়েছে!" }), {
            status: 200,
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });

    } catch (error) {
        // যদি এখনও কলামের নাম না মেলে, তবে এই এররটা তোকে সরাসরি কলামের সঠিক নাম বলে দেবে
        let userFriendlyMessage = error.message;
        if (error.message.includes("no column named whatsapp_number")) {
             // যদি তাও না মেলে, তবে শুধু বেসিক ৩টি ডেটা (নাম, ইউজারনেম, পাসওয়ার্ড) দিয়ে ট্রাই করবে
             try {
                 await env.DB.prepare("INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, 'member')")
                    .bind(name, username, password)
                    .run();
                 return new Response(JSON.stringify({ success: true, message: "নিবন্ধন সফল! (আপনার ডেটাবেজে হোয়াটসঅ্যাপ ও এনআইডি কলাম না থাকায় ওগুলো বাদেই সেভ হয়েছে)" }), {
                     status: 200,
                     headers: { "Content-Type": "application/json; charset=UTF-8" }
                 });
             } catch (innerError) {
                 userFriendlyMessage = "টেবিল কলাম মিসম্যাচ। এরর: " + innerError.message;
             }
        }

        return new Response(JSON.stringify({ success: false, message: "সার্ভার এরর: " + userFriendlyMessage }), {
            status: 500,
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });
    }
}
