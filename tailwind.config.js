/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            boxShadow: {
                "3xl": "inset 0 10px 20px -5px rgb(0 0 0 / 0.1)",
            },
        },
    },
    plugins: [],
}
