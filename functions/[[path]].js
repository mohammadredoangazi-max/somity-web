export async function onRequest(context) {
  // এটি ক্লাউডফ্লেয়ারকে বলবে সব রিকোয়েস্ট স্ট্যাটিক ফাইলের কাছে পাঠাতে
  return context.next();
}
