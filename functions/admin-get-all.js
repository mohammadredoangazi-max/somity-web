export async function onRequest(context) {
  // যদি ডিরেক্ট env.DB না পায়, তবে ক্লাউডফ্লেয়ারের ইন্টারনাল বাইন্ডিং চেক করবে
  const db = context.env.DB || context.env.__D1_DATABASE_f77e3526_4757_40b1_8295_ed9cf0a1c807;

  if (!db) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Database connection failed. Please check Cloudflare binding." 
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  try {
    // ১. ইউজার টেবিল থেকে ডাটা আনা
    const usersResult = await db.prepare("SELECT username, whatsapp FROM users").all();
    const users = usersResult.results || [];

    // ২. মোট জমার হিসাব
    let totalFund = 0;
    try {
      const res = await db.prepare("SELECT SUM(amount) as total FROM deposits").first();
      totalFund = res ? (res.total || 0) : 0;
    } catch(e) {}

    // ৩. মোট লোনের হিসাব
    let totalLoan = 0;
    try {
      const res = await db.prepare("SELECT SUM(amount) as total FROM loans").first();
      totalLoan = res ? (res.total || 0) : 0;
    } catch(e) {}

    // ৪. লুপ ঘুরিয়ে প্রত্যেক মেম্বারের সামারি রেডি করা
    const finalizedUsers = [];
    for (let user of users) {
      let totalDeposit = 0;
      try {
        const userDep = await db.prepare("SELECT SUM(amount) as total FROM deposits WHERE username = ?").bind(user.username).first();
        totalDeposit = userDep ? (userDep.total || 0) : 0;
      } catch(e) {}

      let currentLoan = 0;
      try {
        const userLoan = await db.prepare("SELECT SUM(amount) as total FROM loans WHERE username = ? AND status = 'চলতি লোন'").bind(user.username).first();
        currentLoan = userLoan ? (userLoan.total || 0) : 0;
      } catch(e) {}

      finalizedUsers.push({
        username: user.username,
        whatsapp: user.whatsapp || '--',
        totalDeposit: totalDeposit,
        currentMonthStatus: totalDeposit > 0 ? 'পরিশোধিত' : 'বাকি আছে',
        loanStatus: currentLoan > 0 ? `${currentLoan} টাকা বাকি` : 'কোনো লোন নেই'
      });
    }

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
