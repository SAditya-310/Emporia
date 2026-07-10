import "../css/Category.css";

function Category({ selectedCategory, setSelectedCategory }) {

    const categories = [
        "All",
        "Mobiles",
        "Laptops",
        "Accessories",
        "Wearables",
        "Footwear"
    ];

    return (

        <div className="category-container">

            {
                categories.map((category, index) => (

                    <button
                        key={index}
                        className={
                            selectedCategory === category
                            ? "active-category"
                            : ""
                        }
                        onClick={() => setSelectedCategory(category)}
                    >

                        {category}

                    </button>

                ))
            }

        </div>

    );

}

export default Category;