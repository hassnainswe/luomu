import { Link } from 'react-router-dom';
import { formatPrice, PLACEHOLDER_IMAGE as PLACEHOLDER } from '../lib/utils';
import useCartStore from '../store/cartStore';

const StarIcon = ({ filled }) => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);


export default function ProductCard({ product }) {
  const { addItem, openCart } = useCartStore();

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    openCart();
  };

  // Second photo, shown on hover (desktop only).
  const altImage = product.images?.find((src) => src && src !== product.primary_image_url);
  const stars = Math.round(product.rating_avg || 0);
  const badge = product.is_bestseller
    ? 'Bestseller'
    : product.tags?.[0]
    ? product.tags[0]
    : null;

  return (
    <div className="product-card">
      <div className="product-card__image-wrap">
        <img
          src={product.primary_image_url || PLACEHOLDER}
          alt={product.name}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
          loading="lazy"
        />
        {altImage && (
          <img className="product-card__alt" src={altImage} alt="" aria-hidden="true" loading="lazy" />
        )}
        {badge && <span className="product-card__badge">{badge}</span>}
        <button type="button" className="product-card__quick" onClick={handleAdd} aria-label={`Add ${product.name} to bag`}>
          Add to bag · {formatPrice(product.price_pkr)}
        </button>
      </div>

      <div className="product-card__body">
        <p className="product-card__tagline">{product.tagline}</p>

        {product.rating_avg > 0 && (
          <div className="product-card__rating">
            <span className="stars">
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon key={i} filled={i < stars} />
              ))}
            </span>
            <span>{product.rating_avg}</span>
          </div>
        )}

        <h3 className="product-card__name">
          {/* Stretched link: covers the whole card, so the "+" button isn't nested inside a link. */}
          <Link to={`/products/${product.slug}`} className="product-card__link">{product.name}</Link>
        </h3>
        <p className="product-card__desc">{product.short_description}</p>

        <div className="product-card__footer">
          <div>
            <span className="product-card__price">{formatPrice(product.price_pkr)}</span>
            {product.compare_price_pkr && (
              <span className="product-card__price-compare">{formatPrice(product.compare_price_pkr)}</span>
            )}
            <p style={{ fontSize: 10, color: 'var(--color-secondary)', marginTop: 2 }}>Tax included</p>
          </div>
          <button
            className="product-card__add"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to bag`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
