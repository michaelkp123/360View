import { useLoaderData, Form } from "@remix-run/react";
import svg from "../../public/SvgIntro.svg";
import { redirect } from '@remix-run/node';
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../shopify.server";
import { LegacyCard, EmptyState, Page } from "@shopify/polaris";

export const loader = async ({ request }) => {
    const productId = new URL(request.url).searchParams.get('productId');
    const prisma = new PrismaClient();
    const { admin } = await authenticate.admin(request);
    
    const response = await admin.graphql(
      `#graphql
        query {
          product(id: "${productId}") {
            descriptionHtml
            id
            title
            handle
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
  
      return responseJson;
};

export const action = async ({ request }) => {
  const prisma = new PrismaClient();
  const form = await request.formData();
  const productId = form.get("productId");

  // Get the iframe string from the form data
  const iframe = form.get("iframe");

  // Add frameBorder="0" to the iframe string to remove borders
  const modifiedIframe = `${iframe.replace(/<iframe/, '<iframe frameBorder="0"')}`;

  const createImg = await prisma.image360.create({
    data: {
      title: form.get("Title"),
      productId: productId,
      productHandle: form.get("productHandle"),
      iframeName: modifiedIframe
    }
  });

  return redirect(`/app/activate?productId=${productId}`);
}
  
export default function UpdateIframe() {
  const loaderData = useLoaderData();
  const productTitle = loaderData.data.product.title;
  const productId = loaderData.data.product.id;
  const productHandle = loaderData.data.product.handle;

  return (
    <Page title={productTitle}>
      <LegacyCard sectioned>
        <EmptyState>
          <img src={svg} alt={productTitle} height={350} width={350} />
          <p style={{ marginBottom: "15px" }}>
            And paste it down under
          </p>
          <Form method="POST" encType="multipart/form-data">
          <input type="text" name="Title" value={productTitle} hidden  readOnly/>
          <input type="text" name="productId" value={productId} hidden  readOnly/>
          <input type="text" name="productHandle" value={productHandle} hidden readOnly />
          <input type="text" name="iframe" style={{ width: '300px' }}/>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button type="submit">Save</button>
              </div>
          </Form>
        </EmptyState>
      </LegacyCard>
    </Page>
  );
}