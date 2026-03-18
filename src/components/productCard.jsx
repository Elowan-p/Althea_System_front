const ProductCard = ({ product, isLoading }) => {

    if (isLoading || !product) {
        return (
            <div className="product-card skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-info">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line text"></div>
                    <div className="skeleton-line text"></div>
                    <div className="skeleton-line price"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-card">
            <div className="product-image">
                <img src={product.pictureUrl} alt={product.title} />
                {!product.isPublished && <span className="badge">Brouillon</span>}
            </div>

            <div className="product-info">
                <span className="category-tag">{product.medicalDomain}</span>
                <h3>{product.title}</h3>
                <p className="description">{product.description}</p>

                <div className="details">
                    <span> Fonctionne sur {product.powerSupplyType}</span>
                    <span> Encore {product.inStock} en stock</span>
                </div>

                <div className="footer">
                    <span className="price">{product.price} €</span>
                    <button className="add-to-cart">Détails</button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;