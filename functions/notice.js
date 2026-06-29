// 📢 functions/notice.js - নোটিশ হ্যান্ডলিং এপিআই (GET & POST)

// ১. সদস্য ড্যাশবোর্ডের জন্য নোটিশ রিড করা (GET Request)
export async function onRequestGet(context) {
    try {
        // তোর Cloudflare D1 Database বা KV binding চেক করা
        // এখানে ধরি তোর ডাটাবেজ বাইন্ডিং এর নাম 'DB' বা 'SOMITY_DB'
        const db = context.env.DB || context.env.SOMITY_DB;
        
        if (!db) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "ডাটাবেজ বাইন্ডিং (DB/SOMITY_DB) খুঁজে পাওয়া যায়নি!" 
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        // ডাটাবেজের 'settings' বা 'notice' টেবিল থেকে কারেন্ট নোটিশটি নিয়ে আসা
        // এখানে আমরা ধরে নিচ্ছি তোর টেবিলে key-value আকারে ডাটা আছে অথবা সরাসরি নোটিশ টেবিল আছে
        const { results } = await db.prepare("SELECT content FROM notice WHERE id = 1 LIMIT 1").all();
        
        let noticeContent = "সঞ্চয় সমিতির সকল সদস্যকে নিয়মিত ও নির্দিষ্ট সময়ের মধ্যে মাসিক কিস্তির টাকা জমা দেওয়ার জন্য অনুরোধ করা যাচ্ছে।"; // ডিফল্ট নোটিশ
        
        if (results && results.length > 0) {
            noticeContent = results[0].content;
        }

        return new Response(JSON.stringify({ success: true, content: noticeContent }), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // CORS পলিসি হ্যান্ডেল করার জন্য
            }
        });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

// ২. অ্যাডমিন প্যানেল থেকে নোটিশ সেভ করা (POST Request)
export async function onRequestPost(context) {
    try {
        const db = context.env.DB || context.env.SOMITY_DB;
        
        if (!db) {
            return new Response(JSON.stringify({ success: false, error: "ডাটাবেজ কানেকশন নেই!" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        // অ্যাডমিন প্যানেল থেকে পাঠানো JSON ডেটা রিসিভ করা
        const body = await context.request.json();
        const newNotice = body.content;

        if (!newNotice || newNotice.trim() === "") {
            return new Response(JSON.stringify({ success: false, error: "নোটিশের কন্টেন্ট খালি রাখা যাবে না!" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // ডাটাবেজে আইডি ১ নাম্বারে নোটিশটি আপডেট করা (যদি না থাকে তবে ইনসার্ট করা)
        // এই কুয়েরিটি আইডি ১ এর নোটিশ টেক্সটকে নতুন টেক্সট দিয়ে রিপ্লেস করে দেবে
        await db.prepare(`
            INSERT INTO notice (id, content) 
            VALUES(1, ?) 
            ON CONFLICT(id) DO UPDATE SET content = ?
        `).bind(newNotice, newNotice).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

// OPTIONS রিকোয়েস্ট হ্যান্ডেল করা (CORS প্রি-ফ্লাইট রিকোয়েস্টের জন্য)
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}
