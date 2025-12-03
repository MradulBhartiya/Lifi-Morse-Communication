# LiFi-Morse-Communication

A simple project combining **Morse code** encoding/decoding with **LiFi (visible-light communication)** — sending and receiving text messages using visible light pulses (LED flickering). This project demonstrates how data can be transmitted wirelessly through light.

---

## 🔦 Overview

This project converts text → Morse code → visible-light pulses → receives them using a light sensor → decodes back to text.

It is useful for:
- Understanding fundamentals of communication (encoding → modulation → decoding)
- Learning about LiFi (Light Fidelity)
- Building a simple wireless text-transfer system without RF modules

---

## 📁 Repository Structure

/assets → images, icons, etc.
/static → styling & supporting files
index.html → main UI for Morse communication

> *Hardware decoding (Arduino/ESP/Photodiode) is optional and can be added to extend this project.*

---

## 🛠️ How It Works

1. User enters text in the UI  
2. Text converts to **Morse code**  
3. Morse transmits via **LED blinking**  
4. A **photodiode / LDR / light sensor** detects pulses  
5. Pulses decode back into text  
6. Output appears on receiver UI  

---

## 🚀 Beginner-Friendly Setup (Desktop)

This guide helps complete beginners run the project using a simple local server + Ngrok for tunneling.

---

## 🖥️ How to Run Locally (Desktop Setup)

### **Step 1: Open the Project in VS Code / Cursor**
1. Download or clone the repository  
2. Open the folder inside your IDE  
3. Open the IDE terminal  
   - VS Code: `Ctrl + ~`

---

### **Step 2: Install & Start Local Server**
We use `http-server` because browsers block local file scripts.

#### **One-time setup**
**run**`npm install -g http-server`

Start the server
 **run**`http-server .`
 
You will see something like:
`http://127.0.0.1:8080`
`http://192.168.1.5:8080`
Your app is now running locally.

🌐 Public Link Setup (Using Ngrok)
Use Ngrok to expose your local server so you can test on mobile devices, or share with others.

Step 1: Create Ngrok Account
🔗 https://ngrok.com/


Step 2: Download Ngrok (Windows)
🔗 https://ngrok.com/download/windows?tab=download


Step 3: Extract ZIP
Inside the extracted folder, you'll find:

`ngrok.exe`
Remember this folder path.


Step 4: Add Auth Token
Open CMD and navigate to the Ngrok folder:(Example) `cd C:\Users\hp\Downloads\ngrok`

Run this (from your Ngrok dashboard): `ngrok config add-authtoken <YOUR_TOKEN_HERE>`
(One-time setup)


Step 5: Start Tunneling
Your local server runs on port 8080, so run: `ngrok http 8080`

You will see something like: `Forwarding  https://abcd-1234.ngrok-free.app -> http://localhost:8080`


This is your final public link.
You can open this on mobile, laptop, or share it with anyone.
