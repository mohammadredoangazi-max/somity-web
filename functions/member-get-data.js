export async function onRequestGet(context) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const username = url.searchParams.get("username");

    if (!username) {
      return new Response(JSON.stringify({ success: false, error: "ইউজারনেম পাওয়া যায়নি" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ১. ডাটাবেজ থেকে এই ইউজারের আইডি, নাম বা মোবাইল দিয়ে সার্চ করা
    const member = await env.DB.prepare(
      "SELECT * FROM members WHERE username = ? OR phone = ? OR id = ?"
    ).bind(username, username, username).first();

    // ২. সমিতির মোট ফান্ডের হিসাব বের করা
    const totalFundRow = await env.DB.prepare("SELECT SUM(total_deposit) as total FROM members").first();
    const totalSomityFund = totalFundRow ? totalFundRow.total : 0;

    if (member) {
      return new Response(JSON.stringify({
        success: true,
        data: {
          totalDeposit: member.total_deposit || 0, // এডমিন প্যানেলের 'মোট জমা'
          totalFund: totalSomityFund || 50000,     // সমিতির মোট ফান্ড (খালি হলে ৫০,০০০ ব্যাকআপ)
          loanStatus: member.loan_balance ? member.loan_balance + " টাকা" : "০ টাকা"
        }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ব্যাকআপ টেস্ট ডেটা (যদি ডাটাবেজে ইউজার এখনো তৈরি না হয়ে থাকে)
    if (username === "redoan" || username === "01748723661") {
      return new Response(JSON.stringify({
        success: true,
        data: { totalDeposit: 500, totalFund: 50000, loanStatus: "০ টাকা" }
      }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: false, error: "সদস্য পাওয়া যায়নি" }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
