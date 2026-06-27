export async function onRequestGet(context) {
    const { env, request } = context;
    
    if (!env.DB) {
        return new Response(JSON.stringify({ success: false, message: "ডেটাবেজ কানেকশন পাওয়া যায়নি।" }), {
            status: 500,
            headers: { "Content-Type": "application/json; charset=UTF-8", "Access-Control-Allow-Origin": "*" }
        });
    }

    try {
        const url = new URL(request.url);
        const username = url.searchParams.get("username");

        if (!username) {
            return new Response(JSON.stringify({ success: false, message: "ইউজারনেম প্রয়োজন।" }), {
                status: 400,
                headers: { "Content-Type": "application/json; charset=UTF-8" }
            });
        }

        // ১. এই মেম্বারের আগের কতজন রেজিস্টার্ড মেম্বার আছে তা গুনে সিরিয়াল আইডি বের করা
        // যেমন: ১ম মেম্বার হলে rowid বা count হবে ১, আইডি দেখাবে #01
        const allUsers = await env.DB.prepare("SELECT username FROM users ORDER BY rowid ASC").all();
        let userIndex = allUsers.results.findIndex(u => u.username === username);
        
        // যদি ইউজার খুঁজে না পাওয়া যায়, ব্যাকআপ হিসেবে ০১ ধরবে
        let memberId = "01"; 
        if (userIndex !== -1) {
            const serialNumber = userIndex + 1;
            memberId = serialNumber < 10 ? "0" + serialNumber : "" + serialNumber;
        }

        // ২. এডমিনের এন্ট্রি করা ফান্ডের হিসাব নিয়ে আসা (ধরে নিচ্ছি 'payments' বা 'funds' টেবিলে জমা থাকবে)
        // শুরুতে যেহেতু কোনো ট্রানজেকশন বা এন্ট্রি নেই, তাই ডিফল্ট ০ টাকা দেখাবে।
        let totalFund = 0;
        let myDeposit = 0;

        try {
            // যদি তোর জমার টেবিলের নাম 'payments' হয়, তবে সেখান থেকে মোট ফান্ডের যোগফল নেবে
            const fundResult = await env.DB.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'approved'").first();
            if (fundResult && fundResult.total) {
                totalFund = fundResult.total;
            }

            // এই নির্দিষ্ট মেম্বারের মোট কত টাকা জমা হয়েছে তার যোগফল
            const myDepositResult = await env.DB.prepare("SELECT SUM(amount) as total FROM payments WHERE username = ? AND status = 'approved'")
                .bind(username)
                .first();
            if (myDepositResult && myDepositResult.total) {
                myDeposit = myDepositResult.total;
            }
        } catch (tableError) {
            // পেমেন্ট টেবিল এখনও এন্ট্রি না হয়ে থাকলে বা খালি থাকলে ০ টাকাই থাকবে, ক্র্যাশ করবে না
            totalFund = 0;
            myDeposit = 0;
        }

        return new Response(JSON.stringify({
            success: true,
            memberId: memberId,
            totalFund: totalFund,
            myDeposit: myDeposit
        }), {
            status: 200,
            headers: { "Content-Type": "application/json; charset=UTF-8", "Access-Control-Allow-Origin": "*" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: "সার্ভার এরর: " + error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        });
    }
}
