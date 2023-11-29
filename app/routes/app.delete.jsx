import { redirect } from '@remix-run/node';
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    const productId = new URL(request.url).searchParams.get('productId');
    const prisma = new PrismaClient();
    const { admin } = await authenticate.admin(request);
    
    const response = await admin.graphql(
      `#graphql
        query {
          product(id: "${productId}") {
            descriptionHtml
          }
        }`,
    );
    
    const responseJson = await response.json();
    
    let productDescription = responseJson.data.product.descriptionHtml;
  
    // Use a regular expression to remove the entire iframe tag
    productDescription = productDescription.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');


    
  await admin.graphql(
    `mutation {
      productUpdate(input: {
        id: "${productId}",
        descriptionHtml: "${productDescription}"
      }) {
        product {
          id
          title
        }
      }
    }`
    );
    
    await prisma.image360.deleteMany({
        where: {
          productId: productId,
        },
      });
  
      return redirect(`/app`);
  };