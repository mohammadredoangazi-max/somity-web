<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>বন্ধুত্ব সঞ্চয় সমিতি - লগইন</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: linear-gradient(rgba(0, 123, 255, 0.6), rgba(0, 123, 255, 0.6)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: rgba(255, 255, 255, 0.95);
            padding: 40px 30px;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }

        .logo-area img {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 10px;
        }

        h2 {
            color: #333;
            margin-bottom: 5px;
            font-size: 24px;
        }

        .subtitle {
            color: #666;
            font-size: 14px;
            margin-bottom: 25px;
        }

        .form-group {
            margin-bottom: 18px;
            text-align: left;
        }

        label {
            display: block;
            color: #444;
            margin-bottom: 6px;
            font-size: 14px;
            font-weight: 600;
        }

        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: 0.3s;
        }

        input:focus {
            border-color: #007bff;
            box-shadow: 0 0 5px rgba(0, 123, 255, 0.2);
        }

        .btn-submit {
            width: 100%;
            padding: 14px;
            background: #007bff;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
            margin-top: 10px;
        }

        .btn-submit:hover {
            background: #0056b3;
        }

        .footer-link {
            margin-top: 20px;
            font-size: 14px;
            color: #555;
        }

        .footer-link a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="logo-area">
            <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=150&q=80" alt="সমিতি লোগো">
        </div>

        <h2>বন্ধুত্ব সঞ্চয় সমিতি</h2>
        <div class="subtitle">সদস্য হিসেবে লগইন করুন</div>

        <form id="loginForm">
            <div class="form-group">
                <label>ইউজারনেম</label>
                <input type="text" id="username" placeholder="আপনার ইউজারনেম লিখুন" required>
            </div>

            <div class="form-group">
                <label>পাসওয়ার্ড</label>
                <input type="password" id="password" placeholder="আপনার পাসওয়ার্ড লিখুন" required>
            </div>

            <button type="submit" class="btn-submit">লগইন করুন</button>
        </form>

        <div class="footer-link">
            নতুন সদস্য? <a href="/index.html">এখানে নাম নিবন্ধন করুন</a>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                // সরাসরি নতুন functions/login.js ফাইলে হিট করবে (কোনো /api/ নেই)
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    // সেশন বা লোকাল স্টোরেজে ইউজারনেম সেভ রাখা যাতে ড্যাশবোর্ডে ডাটা আনা যায়
                    localStorage.setItem('username', data.username);
                    alert("লগইন সফল হয়েছে!");
                    window.location.href = '/member.html'; // ড্যাশবোর্ডে নিয়ে যাবে
                } else {
                    alert(data.message || "ভুল ইউজারনেম বা পাসওয়ার্ড!");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("সার্ভার রেসপন্স করছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।");
            }
        });
    </script>

</body>
</html>
