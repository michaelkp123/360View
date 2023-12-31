import { useLoaderData, Form } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import svg from "../../public/SvgIntro.svg";
import { LegacyCard, EmptyState, Page } from "@shopify/polaris";
import { PrismaClient } from "@prisma/client";
import { 
  redirect
} from '@remix-run/node';
import indexStyles from "../../public/style.css";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const productId = new URL(request.url).searchParams.get('productId');

  
  const prisma = new PrismaClient();

  const existingImages = await prisma.image360.findMany({
    where: {
      productId: productId,
    },
  });

  if (existingImages.length > 0) {
    // Records with the same productId exist, redirect accordingly
    return redirect(`/app/activate?productId=${productId}`);
  }

  const response = await admin.graphql(
    `#graphql
      query {
          product(id: "${productId}") {
              id
              title
              handle
          }
      }`,
  );

  const responseJson = await response.json();

  return responseJson;
};


export const action = async ({ request }) => {
  const prisma = new PrismaClient();
  const form = await request.formData();

  // Get the iframe string from the form data
  const iframe = form.get("iframe");

  // Add frameBorder="0" to the iframe string to remove borders
  const modifiedIframe = `${iframe.replace(/<iframe/, '<iframe frameBorder="0"')}`;

  const createImg = await prisma.image360.create({
    data: {
      title: form.get("Title"),
      productId: form.get("productId"),
      productHandle: form.get("productHandle"),
      iframeName: modifiedIframe
    }
  });

  return createImg; // Return the newly created record
}



export default function AddPicture() {
  const loaderData = useLoaderData();
  const productTitle = loaderData.data.product.title;
  const productId = loaderData.data.product.id;
  const productHandle = loaderData.data.product.handle;

  return (
    <Page backAction={{ content: 'Products', url: '/app' }} title={productTitle}>
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
              <button class="SaveButton" type="submit">Save</button>
              </div>
          </Form>
        </EmptyState>
      </LegacyCard>
    </Page>
  );
}