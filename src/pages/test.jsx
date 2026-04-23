import ProductCard from "../components/productCard"

const Test = () => {
    return (
        <ProductCard product={{
            title: "Test Product",
            description: "This is a test product.",
            price: 99.99,
            pictureUrl: "https://via.placeholder.com/150",
            medicalDomain: "Cardiology",
            powerSupplyType: "Battery",
            inStock: 10,
            isPublished: true
        }} isLoading={false} />
    )
}

export default Test 