import Header from "../components/Header.jsx";
import HeroSection from "../components/HeroSection.jsx";
import ProductShowcase from "../components/ProductShowcase.jsx";

const LandingPage = () => {
    return (
        <div className="bg-white font-sans text-gray-800">
            <Header />

            <main>
                <HeroSection />

                <ProductShowcase />

                {/* About Us */}
                <section id="about" className="py-20 px-6 bg-gray-50">
                    <div className="max-w-6xl mx-auto text-center">
                        <p className="text-purple-600 font-semibold mb-2">
                            ABOUT US
                        </p>

                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Manage Your Money With Confidence
                        </h2>

                        <p className="max-w-3xl mx-auto text-gray-600 leading-7">
                            Expense Manager helps you keep track of your
                            income, expenses and financial activities in one
                            simple place. Easily monitor your spending,
                            organize transactions and understand your
                            financial habits.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;