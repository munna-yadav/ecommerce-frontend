
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const featuredProducts = [
    {
      id: 1,
      name: "Premium Headphones",
      price: "$299",
      rating: 5,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      name: "Smart Watch",
      price: "$199",
      rating: 4,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 3,
      name: "Wireless Earbuds",
      price: "$159",
      rating: 5,
      image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&auto=format&fit=crop&q=60",
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 to-white">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
                Discover Amazing Products
              </h1>
              <p className="text-lg text-gray-600">
                Shop the latest trends in electronics, fashion, and more. Get exclusive deals and premium quality products.
              </p>
              <div className="flex gap-4">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Shop Now <ShoppingCart className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60"
                alt="Hero"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 font-bold">{product.price}</span>
                    <div className="flex items-center">
                      {Array(product.rating).fill(0).map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                    Add to Cart
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Free Shipping",
                description: "On orders over $50",
                icon: "🚚",
              },
              {
                title: "24/7 Support",
                description: "Always here to help",
                icon: "💬",
              },
              {
                title: "Money Back",
                description: "30-day guarantee",
                icon: "💰",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="text-center p-6 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
