import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Text,
  Card,
  List,
  TextField,
  Link,
  Pagination,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query {
        products(first: 100, reverse: false) {
          edges {
            node {
              id
              title
              handle
              images(first: 1) {
                nodes {
                  id
                  url
                }
              }
            }
          }
        }
      }`,
  );

  const responseJson = await response.json();

  return json({
    products: responseJson.data.products.edges,
  });
};

export default function Showproducts() {
  const actionData = useLoaderData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const products = actionData?.products;

  useEffect(() => {
    if (products) {
      shopify.toast.show("Products loaded");
      // Reset the current page to 1 when the component mounts
      setCurrentPage(1);
    }
  }, [products]);

  // Reset the current page to 1 when the search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter products based on the search query and current page
  const filteredProducts = products
    ? products
        .filter((product) =>
          product.node.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
    : [];

  const handlePaginationChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <Page title="All products">
      <div style={{ marginLeft: '25%', width: '50%', marginBottom: '10px' }}>
        <TextField
          width="50"
          label="Search Products"
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
        />
      </div>
      <List>
        {filteredProducts.map((product) => (
          <Card key={product.node.id}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={product.node.images.nodes[0]?.url || "https://fakeimg.pl/50x60"}
                alt={product.node.title}
                width="50"
                height="60"
              />
              <div style={{ marginLeft: '10px' }}>
                <Text variant="headingMd" as="h6" fontWeight="medium">
                  {product.node.title}
                </Text>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Link
                  removeUnderline
                  variant="primary"
                  onClick={() =>
                    navigate(`/app/addIframe?productId=${product.node.id}`)
                  }
                >
                  Add 360 view
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </List>
      {products && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <div style={{ display: 'inline-block' }}>
            <Pagination
              hasPrevious={currentPage > 1}
              hasNext={filteredProducts.length === productsPerPage}
              onPrevious={() => handlePaginationChange(currentPage - 1)}
              onNext={() => handlePaginationChange(currentPage + 1)}
            />
          </div>
        </div>
      )}
    </Page>
  );
}