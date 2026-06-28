export async function onRequest(context) {
    const { env } = context;
    
    try {
        // ১. ডাটাবেজ থেকে সব ইউজার বা মেম্বারদের নিয়ে আসা (যারা সাইন-আপ করেছে)
        const usersResult = await env.DB.prepare(
            "SELECT username, whatsapp FROM users"
        ).all();
        
        const users = usersResult.results || [];

        // ২. ডাটাবেজ থেকে সব জমার মোট হিসাব আনা
        const totalFundResult = await env.DB.prepare(
            "SELECT SUM(amount) as total FROM deposits"
        ).first();
        const totalFund = totalFundResult ? (totalFundResult.total || 0) : 0;

        // ৩. ডাটাবেজ থেকে মোট কত লোন দেওয়া হয়েছে তা আনা
        const totalLoanResult = await env.DB.prepare(
            "SELECT SUM(amount) as total FROM loans"
        ).first();
        const totalLoan = totalLoanResult ? (totalLoanResult.total || 0) : 0;

        // ৪. প্রতিটি মেম্বারের আলাদা আলাদা মোট জমা ও লোন স্ট্যাটাস প্রসেস করা
        const finalizedUsers = await Promise.all(users.map(async (user) => {
            // মেম্বারের মোট জমা হিসাব
            const userDep = await env.DB.prepare(
                "SELECT SUM(amount) as total FROM deposits WHERE username = ?"
            ).bind(user.username).first();
            
            // মেম্বারের লোন আছে কিনা বা কত লোন হিসাব
            const userLoan = await env.DB.prepare(
                "SELECT SUM(amount) as total FROM loans WHERE username = ?"
            ).bind(user.username).first();

            return {
                username: user.username,
                whatsapp: user.whatsapp || '--',
                totalDeposit: userDep ? (userDep.total || 0) : 0,
                currentMonthStatus: userDep && userDep.total > 0 ? 'পরিশোধিত' : 'বাকি আছে',
                loanStatus: userLoan && userLoan.total > 0 ? `${userLoan.total} টাকা লোন` : 'কোনো লোন নেই'
            };
        }));

        return new Response(JSON.stringify({
            success: true,
            totalFund: totalFund,
            totalLoan: totalLoan,
            results: finalizedUsers
        }), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // CORS এরর এড়ানোর জন্য
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
