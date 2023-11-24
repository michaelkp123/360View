import { Page, Card, } from "@shopify/polaris";
import { useLoaderData, Form, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { useState, useEffect, useRef } from 'react';

const DeleteButton = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: 'absolute',
      top: '2px',
      right: '-4px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'red',
      fontSize: '18px',
    }}
  >
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="timeline_close_item">
      <circle cx="11.5" cy="10.5" r="7.5" fill="white"></circle>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.4118 2C6.76637 2 3 5.76637 3 10.4118C3 15.0582 6.76637 18.8235 11.4118 18.8235C16.0572 18.8235 19.8235 15.0582 19.8235 10.4118C19.8235 5.76637 16.0572 2 11.4118 2ZM9.00085 6.51427C8.59023 6.10364 7.92448 6.10364 7.51385 6.51427C7.10323 6.92489 7.10323 7.59065 7.51385 8.00127L9.92476 10.4122L7.51385 12.8231C7.10323 13.2337 7.10323 13.8995 7.51385 14.3101C7.92448 14.7207 8.59023 14.7207 9.00085 14.3101L11.4118 11.8992L13.8227 14.3101C14.2333 14.7207 14.8991 14.7207 15.3097 14.3101C15.7203 13.8995 15.7203 13.2337 15.3097 12.8231L12.8988 10.4122L15.3097 8.00127C15.7203 7.59065 15.7203 6.92489 15.3097 6.51427C14.8991 6.10364 14.2333 6.10364 13.8227 6.51427L11.4118 8.92518L9.00085 6.51427Z" fill="#8C9196"></path>
    </svg>
  </button>
);

export const loader = async ({ request }) => {
  const productId = new URL(request.url).searchParams.get('productId');


    return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const productId = formData.get("productId");

  // Update the iframeAltText to include the iframe tag with the correct src
  const iframeAltText = `<iframe src="../../public/htmlIframe/IframeTest" frameborder="0" style="width: 100%; height: 500px;"></iframe>`;
  //const iframeAltText = `<iframe src="https://spinzam.com/shot/embed/?idx=425179" width="640" height="640" scrolling="no" style="max-width:100%; max-height:100vw;"></iframe>`;

  await admin.graphql(
    `mutation {
      productUpdate(input: {
        id: "${productId}",
        descriptionHtml: "${iframeAltText.replace(/"/g, '\\"')}"
      }) {
        product {
          id
          title
        }
      }
    }`
  );

  return true;
};

export default function Index() {
  const loaderData = useLoaderData();
  const productId = loaderData;
  const navigate = useNavigate();

  return (
    <Page backAction={{ content: 'Products', url: '/app' }} title="Product list">
    </Page> 
  );
}