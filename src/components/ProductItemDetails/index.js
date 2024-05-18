import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {Link} from 'react-router-dom'

import {BsDashSquare, BsPlusSquare} from 'react-icons/bs'

import SimilarProductItem from '../SimilarProductItem'
import Header from '../Header'

import './index.css'

const apiStatusConstants = {
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
  initial: 'INITIAL',
}

class ProductItemDetails extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    productData: {},
    similarProductsData: [],
    quantity: 1,
  }

  componentDidMount() {
    this.getProductDetails()
  }

  getFormattedData = data => ({
    id: data.id,
    imageUrl: data.image_url,
    title: data.title,
    price: data.price,
    description: data.description,
    brand: data.brand,
    totalReviews: data.total_reviews,
    rating: data.rating,
    availability: data.availability,
  })

  getProductDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})

    const {match} = this.props
    const {params} = match
    const {id} = params

    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }

    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const fetchedData = await response.json()
      const updatedData = this.getFormattedData(fetchedData)
      const updataedSimilarProductsData = fetchedData.similar_products.map(
        eachProduct => this.getFormattedData(eachProduct),
      )
      this.setState({
        productData: updatedData,
        similarProductsData: updataedSimilarProductsData,
        apiStatus: apiStatusConstants.success,
      })
    }
    if (response.status === 404) {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  onDecrementQuantity = () => {
    const {quantity} = this.state
    if (quantity > 1) {
      this.setState(prevState => ({quantity: prevState.quantity - 1}))
    }
  }

  onIncrementQuantity = () => {
    this.setState(prevState => ({quantity: prevState.quantity + 1}))
  }

  renderProductItemView = () => {
    const {productData, quantity, similarProductsData} = this.state
    const {
      imageUrl,
      title,
      price,
      rating,
      totalReviews,
      description,
      availability,
      brand,
    } = productData

    return (
      <>
        <div className="product-detail-success-view">
          <div className="product-img-container">
            <img src={imageUrl} alt="product" className="product-img" />
          </div>
          <div className="product-item-details">
            <h1 className="product-title">{title}</h1>
            <p className="product-price">Rs {price}/- </p>
            <div className="rating-reviews-container">
              <div className="product-rating-container">
                <p className="rating">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                  className="star-img"
                />
              </div>
              <p className="reviews">{totalReviews} Reviews</p>
            </div>
            <p className="description">{description}</p>
            <div className="label-container">
              <p className="label">Available: </p>
              <p className="value">{availability}</p>
            </div>
            <div className="label-container">
              <p className="label">Brand: </p>
              <p className="value">{brand}</p>
            </div>
            <hr className="horizontal-line" />
            <div className="quantity-container">
              <button
                className="quantity-control-btn"
                type="button"
                data-testid="minus"
                onClick={this.onDecrementQuantity}
                aria-label="Decrease quantity"
              >
                <BsDashSquare className="minus-btn" />
              </button>
              <p className="quantity">{quantity}</p>
              <button
                className="quantity-control-btn"
                type="button"
                data-testid="plus"
                onClick={this.onIncrementQuantity}
                aria-label="Increment quantity"
              >
                <BsPlusSquare className="plus-btn" />
              </button>
            </div>
            <button className="cart-btn" type="button">
              ADD TO CART
            </button>
          </div>
        </div>
        <h1 className="similar-products-heading">Similar Products</h1>
        <ul className="similar-products-container">
          {similarProductsData.map(eachProduct => (
            <SimilarProductItem
              productDetails={eachProduct}
              key={eachProduct.id}
            />
          ))}
        </ul>
      </>
    )
  }

  renderLoadingView = () => (
    <div className="products-details-loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div className="failure-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
        className="error-img"
      />
      <h1 className="failure-heading">Product Not Found</h1>
      <Link to="/products">
        <button className="failure-btn" type="button" data-testid="failure">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  renderProductItemDetails = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProductItemView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <div className="product-item-details-container">
        <Header />
        {this.renderProductItemDetails()}
      </div>
    )
  }
}

export default ProductItemDetails
