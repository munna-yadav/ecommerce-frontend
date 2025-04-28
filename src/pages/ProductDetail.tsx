import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingCart, Star, Heart, ArrowLeft, Loader2, Plus, Minus, Share2, Check, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

// Define product interface
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number | null;
  image: string | null;
  specs?: { [key: string]: string };  // Optional specifications
  features?: string[];                // Optional features list
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  
  // Format price to display with currency symbol
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };
  
  // Fallback image for products without images
  const fallbackImage = "https://via.placeholder.com/600x400?text=No+Image";

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/v1/product/get/${id}`);
        setProduct(response.data);
        
        // After fetching product, get related products
        try {
          // This would typically be a call to get related products by category or similarity
          // For now, just get a few random products
          const relatedResponse = await axios.get('/api/v1/product/get');
          // Filter out the current product and limit to 4 products
          const filtered = relatedResponse.data
            .filter((p: Product) => p.id !== parseInt(id as string))
            .slice(0, 4);
          setRelatedProducts(filtered);
        } catch (error) {
          console.error('Error fetching related products:', error);
        }
        
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleIncreaseQuantity = () => {
    if (!product?.quantity || quantity < product.quantity) {
      setQuantity(quantity + 1);
    } else {
      toast.error(`Cannot add more than ${product.quantity} items`);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    await addToCart(parseInt(id as string), quantity);
  };

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    toast.success(isInWishlist 
      ? `${product?.name} removed from wishlist` 
      : `${product?.name} added to wishlist`
    );
    // Here you would update your wishlist in your store/context
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-600 hover:text-purple-600 mb-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
      
      {/* Product Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
          <img 
            src={product.image || fallbackImage} 
            alt={product.name}
            className="w-full h-auto object-contain aspect-square"
            onError={(e) => { 
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
        </div>
        
        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-5 w-5 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">(4.0)</span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-gray-600">12 reviews</span>
          </div>
          
          <div className="text-2xl font-bold text-purple-600 mb-4">
            {formatPrice(product.price)}
          </div>
          
          <div className="prose prose-sm mb-6">
            <p>{product.description}</p>
          </div>
          
          <div className={`mb-6 ${!product.quantity || product.quantity <= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {!product.quantity || product.quantity <= 0 
              ? 'Out of Stock' 
              : `In Stock (${product.quantity} available)`}
          </div>
          
          {/* Quantity Selector */}
          <div className="flex items-center mb-6">
            <span className="mr-4 text-gray-700">Quantity:</span>
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleDecreaseQuantity}
                disabled={quantity <= 1}
                className="h-10 w-10 rounded-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleIncreaseQuantity}
                disabled={!!product.quantity && quantity >= product.quantity}
                className="h-10 w-10 rounded-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={handleAddToCart}
              disabled={!product.quantity || product.quantity <= 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button 
              variant="outline" 
              onClick={toggleWishlist}
              className={isInWishlist ? "bg-red-50 text-red-600 border-red-200" : ""}
            >
              <Heart 
                className={`mr-2 h-5 w-5 ${isInWishlist ? "fill-current text-red-600" : ""}`} 
              /> 
              {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="w-full border-b border-gray-200 pb-0 mb-6">
          <TabsTrigger value="description" className="rounded-b-none">Description</TabsTrigger>
          <TabsTrigger value="specifications" className="rounded-b-none">Specifications</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-b-none">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-4">Product Description</h3>
            <p className="mb-4">{product.description}</p>
            
            {product.features ? (
              <>
                <h4 className="text-lg font-medium mt-6 mb-3">Key Features</h4>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mb-4">
                This is a high-quality product designed to meet all your requirements. It comes with
                exceptional build quality and is designed for durability and performance.
              </p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="specifications">
          {product.specs ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <tbody>
                  {Object.entries(product.specs).map(([key, value], index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="py-2 px-4 border border-gray-200 font-medium">{key}</td>
                      <td className="py-2 px-4 border border-gray-200">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500 italic">
              No specifications available for this product.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reviews">
          <div className="space-y-6">
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-yellow-400 fill-current mx-auto mb-2" />
              <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700">Write a Review</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card 
                key={relatedProduct.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/product/${relatedProduct.id}`)}
              >
                <div className="h-48 bg-gray-100">
                  <img
                    src={relatedProduct.image || fallbackImage}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1" title={relatedProduct.name}>
                    {relatedProduct.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 font-bold">{formatPrice(relatedProduct.price)}</span>
                    <div className="flex items-center">
                      {Array(4).fill(0).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;