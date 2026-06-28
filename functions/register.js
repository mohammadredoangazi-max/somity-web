export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    
    // ফ্রন্টএন্ড ফর্ম থেকে আসা তথ্যগুলো রিসিভ করা হচ্ছে
    const name = body.name;
    const username = body.username?.toLowerCase().trim();
    const password = body.password;
    
    // যদি ফ্রন্টএন্ড থেকে whatsapp_number নামে ডাটা আসে, সেটাকে রিসিভ করা
    const whatsapp = body.whatsapp || body.whatsapp_number || ""; 

    if (!name || !username || !password) {
      return new Response(JSON.stringify({ success: false, error: "সবগুলো ঘর সঠিকভাবে পূরণ করুন!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 🔐 ডাটাবেজে সঠিক কলামের (name, username, whatsapp, password) নাম ব্যবহার করে ডাটা সেভ করা
    await env.DB.prepare(
      "INSERT INTO users (name, username, whatsapp, password) VALUES (?, ?, ?, ?)"
    )
    .bind(name, username, whatsapp, password)
    .run();

    return new Response(JSON.stringify({ success: true, message: "নিবন্ধন সফল হয়েছে!" }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    let errorMsg = error.message;
    if (errorMsg.includes("UNIQUE constraint failed")) {
      errorMsg = "এই ইউজারনেমটি ইতিমধ্যে ব্যবহার করা হয়েছে। অন্য একটি দিন।";
    }
    
    return new Response(JSON.stringify({ success: false, error: "সার্ভার এরর: " + errorMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
