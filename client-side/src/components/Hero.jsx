import heroImg from "../assets/hero.png";
import "../css/hero.css";

function Hero() {

    const scrollToProducts = () => {

        const products = document.getElementById("products");

        if (products) {
            products.scrollIntoView({
                behavior: "smooth"
            });
        }

    };

    return (

        <section
            className="hero"
            style={{ backgroundImage: `url(${heroImg})` }}
        >

            <div className="hero-overlay"></div>

            <div className="hero-content">

                <h1>
                    Welcome to Emporia
                </h1>

                <p>
                    Discover the latest gadgets, fashion, accessories and
                    everyday essentials at the best prices.
                </p>

                <button onClick={scrollToProducts}>
                    Shop Now
                </button>

            </div>

        </section>

    );

}

export default Hero;
