export async function onRequest(context) {
  const { env } = context;

  try {
    // ১. ডেটাবেজ থেকে সব মেম্বারদের লিস্ট নিয়ে আসা
    const usersResult = await env.DB.prepare(
      "SELECT username, whatsapp FROM users"
    ).all();
    const users = usersResult.results || [];

    // ২. ডেটাবেজ থেকে সব জমার মোট হিসাব আনা
    const totalFundResult = await env.DB.prepare(
      "SELECT SUM(amount) as total FROM deposits"
    ).first();
    const totalFund = totalFundResult ? (totalFundResult.total || 0) : 0;

    // ৩. ডেটাবেজ থেকে মোট কত লোন দেওয়া হয়েছে তা আনা
    const totalLoanResult = await env.DB.prepare(
      "SELECT SUM(amount) as total FROM loans"
    ).first();
    const totalLoan = totalLoanResult ? (totalLoanResult.total || 0) : 0;

    // ৪. প্রতিটি মেম্বারের রিয়েল-টাইম টোটাল ডিপোজিট ও লোন ক্যালকুলেট করা
    const finalizedUsers = await Promise.all(users.map(async (user) => {
      // এই মেম্বারের মোট কত টাকা জমা হয়েছে
      const userDep = await env.DB.prepare(
        "SELECT SUM(amount) as total FROM deposits WHERE username = ?"
      ).bind(user.username).first();
      const totalDeposit = userDep ? (userDep.total || 0) : 0;

      // এই মেম্বারের কোনো লোন বাকি আছে কি না
      const userLoan = await env.DB.prepare(
        "SELECT SUM(amount) as total FROM loans WHERE username = ? AND status = 'চলতি লোন'"
      ).bind(user.username).first();
      const currentLoan = userLoan ? (userLoan.total || 0) : 0;

      return {
        username: user.username,
        whatsapp: user.whatsapp || '--',
        totalDeposit: totalDeposit,
        currentMonthStatus: totalDeposit > 0 ? 'পরিশোধিত' : 'বাকি আছে',
        loanStatus: currentLoan > 0 ? `${currentLoan} টাকা বাকি` : 'কোনো লোন নেই'
      };
    }));

    return new Response(
      JSON.stringify({
        success: true,
        totalFund: totalFund,
        totalLoan: totalLoan,
        results: finalizedUsers
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}
