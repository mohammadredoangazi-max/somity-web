export default {
  async fetch(request, env, context) {
    // ১. ডেটাবেজ কানেকশন চেক
    if (!env.DB) {
      return new Response(
        JSON.stringify({ success: false, message: "D1 Database connection missing in env." }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    try {
      // ২. ইউজার টেবিল থেকে ডাটা আনা
      const usersResult = await env.DB.prepare("SELECT username, whatsapp FROM users").all();
      const users = usersResult.results || [];

      // ৩. মোট জমার হিসাব
      let totalFund = 0;
      try {
        const res = await env.DB.prepare("SELECT SUM(amount) as total FROM deposits").first();
        totalFund = res ? (res.total || 0) : 0;
      } catch(e) {}

      // ৪. মোট লোনের হিসাব
      let totalLoan = 0;
      try {
        const res = await env.DB.prepare("SELECT SUM(amount) as total FROM loans").first();
        totalLoan = res ? (res.total || 0) : 0;
      } catch(e) {}

      // ৫. প্রতিটি মেম্বারের আলাদা আলাদা হিসাব ক্যালকুলেট করা
      const finalizedUsers = [];
      for (let user of users) {
        let totalDeposit = 0;
        try {
          const userDep = await env.DB.prepare("SELECT SUM(amount) as total FROM deposits WHERE username = ?").bind(user.username).first();
          totalDeposit = userDep ? (userDep.total || 0) : 0;
        } catch(e) {}

        let currentLoan = 0;
        try {
          const userLoan = await env.DB.prepare("SELECT SUM(amount) as total FROM loans WHERE username = ? AND status = 'চলতি লোন'").bind(user.username).first();
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

      // সাকসেস রেসপন্স পাঠানো
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
};
