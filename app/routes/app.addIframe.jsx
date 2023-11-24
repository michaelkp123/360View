import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import svg from "../../public/SvgIntro.svg";
import { LegacyCard, EmptyState, Page } from "@shopify/polaris";
import { useState } from "react";
import { PrismaClient } from "@prisma/client";
import { 
  redirect
} from '@remix-run/node';

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
  const createImg = await prisma.image360.create({
    data: {
      title: form.get("Title"),
      productId: form.get("productId"),
      productHandle: form.get("productHandle"),
      iframeName: form.get("iframe"),
    }
  });

  return createImg; // Return the newly created record
}



export default function AddPicture() {
  const actionData = useLoaderData();
  const productTitle = actionData.data.product.title;
  const productId = actionData.data.product.id;
  const productHandle = actionData.data.product.handle;

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