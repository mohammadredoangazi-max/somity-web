export async function onRequestGet(context) {
    const { env, request } = context;
    if (!env.DB) return new Response(JSON.stringify({ success: false, message: "DB error" }), { status: 500 });
    try {
        const url = new URL(request.url);
        const username = url.searchParams.get("username");
        if (!username) return new Response(JSON.stringify({ success: false }), { status: 400 });
        const allUsers = await env.DB.prepare("SELECT username FROM users ORDER BY rowid ASC").all();
        let userIndex = allUsers.results.findIndex(u => u.username === username);
        let memberId = "01"; 
        if (userIndex !== -1) {
            const serialNumber = userIndex + 1;
            memberId = serialNumber < 10 ? "0" + serialNumber : "" + serialNumber;
        }
        return new Response(JSON.stringify({ success: true, memberId: memberId, totalFund: 0, myDeposit: 0 }), {
            status: 200, headers: { "Content-Type": "application/json; charset=UTF-8" }
        });
    } catch (error) { return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 }); }
}
