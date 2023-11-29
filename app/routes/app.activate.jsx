import { Toast, Frame, Page, Card, } from "@shopify/polaris";
import { useLoaderData, Form, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from "@prisma/client";
import indexStyles from "../../public/style.css";
import {useState, useCallback} from 'react';

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

const DeleteButton = ({ onDelete }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDelete = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <button
        onClick={handleDelete}
        style={{
          position: 'absolute',
          top: '50px',
          right: '565px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'red',
          fontSize: '18px',
        }}
      >
    <svg width="50" height="50" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="timeline_close_item">
      <circle cx="11.5" cy="10.5" r="7.5" fill="white"></circle>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.4118 2C6.76637 2 3 5.76637 3 10.4118C3 15.0582 6.76637 18.8235 11.4118 18.8235C16.0572 18.8235 19.8235 15.0582 19.8235 10.4118C19.8235 5.76637 16.0572 2 11.4118 2ZM9.00085 6.51427C8.59023 6.10364 7.92448 6.10364 7.51385 6.51427C7.10323 6.92489 7.10323 7.59065 7.51385 8.00127L9.92476 10.4122L7.51385 12.8231C7.10323 13.2337 7.10323 13.8995 7.51385 14.3101C7.92448 14.7207 8.59023 14.7207 9.00085 14.3101L11.4118 11.8992L13.8227 14.3101C14.2333 14.7207 14.8991 14.7207 15.3097 14.3101C15.7203 13.8995 15.7203 13.2337 15.3097 12.8231L12.8988 10.4122L15.3097 8.00127C15.7203 7.59065 15.7203 6.92489 15.3097 6.51427C14.8991 6.10364 14.2333 6.10364 13.8227 6.51427L11.4118 8.92518L9.00085 6.51427Z" fill="#8C9196"></path>
    </svg>
    </button>

{showConfirmation && (
  <div class="confirmation-modal">
    <p>Are you sure you want to delete the iframe?</p>
    <button class="SaveButton" onClick={handleConfirmDelete}>Yes</button>
    <button class="NotButton" onClick={handleCancelDelete}>No</button>
  </div>
)}
</>
);
};

const AddButton = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: 'absolute',
      top: '50px',
      right: '620px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '18px',
    }}
  >
  <svg xmlns="http://www.w3.org/2000/svg" width="43" height="43" viewBox="0 0 64 64" fill="none">
    <path d="M32.38 3.64099C24.7804 3.65158 17.4953 6.67588 12.1225 12.0505C6.74971 17.4252 3.72791 24.7114 3.71997 32.311C3.72791 39.9106 6.74971 47.1968 12.1225 52.5714C17.4953 57.9461 24.7804 60.9704 32.38 60.981C39.9813 60.9731 47.269 57.9499 52.644 52.575C58.0189 47.2 61.042 39.9123 61.05 32.311C61.042 24.7097 58.0189 17.422 52.644 12.047C47.269 6.67206 39.9813 3.64893 32.38 3.64099ZM43.05 25.921C42.8667 26.1957 42.6183 26.4207 42.3269 26.576C42.0355 26.7313 41.7102 26.812 41.38 26.811C40.986 26.8098 40.6007 26.6953 40.27 26.481L34.38 22.551V45.811C34.3809 46.0739 34.3298 46.3344 34.2296 46.5775C34.1294 46.8205 33.9822 47.0414 33.7963 47.2273C33.6104 47.4132 33.3896 47.5605 33.1465 47.6606C32.9034 47.7608 32.6429 47.8119 32.38 47.811C31.8496 47.811 31.3408 47.6003 30.9658 47.2252C30.5907 46.8501 30.38 46.3414 30.38 45.811V22.551L24.49 26.481C24.0483 26.7736 23.5085 26.879 22.9891 26.774C22.4698 26.669 22.0133 26.3622 21.72 25.921C21.4264 25.4805 21.3195 24.9416 21.4225 24.4223C21.5256 23.9031 21.8304 23.4459 22.27 23.151L31.26 17.161L31.27 17.151C31.5984 16.9309 31.9847 16.8135 32.38 16.8135C32.7753 16.8135 33.1616 16.9309 33.49 17.151L33.66 17.271L42.49 23.151C42.9312 23.4443 43.238 23.9008 43.343 24.4202C43.448 24.9395 43.3426 25.4793 43.05 25.921Z" fill="#999999"/>
  </svg>
  </button>
);

const CardWithText = ({ filename, text }) => (
  <Card key={filename} background="bg-surface-secondary">
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img
        src={`/Svg/${filename}`}
        alt={filename}
        style={{ maxWidth: '70px', maxHeight: '70px', marginRight: '10px' }}
      />
      <p>{text}</p>
    </div>
  </Card>
);

export const loader = async ({ request }) => {
  const productId = new URL(request.url).searchParams.get('productId');
  const prisma = new PrismaClient();
  const svgFolderPath = path.join(process.cwd(), 'public/Svg');

  const svgFiles = await fs.readdir(svgFolderPath);

  const existingIframe = await prisma.image360.findMany({
    where: {
      productId: productId,
    },
  });


  return { svgFiles, productId, existingIframe};
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const prisma = new PrismaClient();
  const formData = await request.formData();
  const productId = formData.get("productId");
  const iframe = formData.get("iframe");

  await admin.graphql(
    `mutation {
      productUpdate(input: {
        id: "${productId}",
        descriptionHtml: "${iframe.replace(/"/g, '\\"')}"
      }) {
        product {
          id
          title
        }
      }
    }`
  );

 await prisma.image360.updateMany({
      where: {
        productId: {
          contains: productId,
        },
      },
      data: {
        isOnline: true,
      },
    })
    
    

  return true;
};

export default function Index() {
  const loaderData = useLoaderData();
  const { svgFiles, productId, existingIframe } = loaderData;
  const iframe = existingIframe[0].iframeName;
  const navigate = useNavigate();

  const [active, setActive] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const toastMarkup = active ? (
    <Toast content="Iframe Saved" onDismiss={toggleActive} />
  ) : null;

  return (
    <Frame>
    <Page backAction={{ content: 'Products', url: '/app' }} title="Product list">
      <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '35%', height: '350px', marginTop: '3vh'}}>
            <h2 style={{ marginBottom: '2vh' }}>Preview</h2>
            <AddButton onClick={() => navigate(`/app/updateIframe?productId=${productId}`)} />
            <DeleteButton onDelete={() => navigate(`/app/delete?productId=${productId}`)} />
          <div dangerouslySetInnerHTML={{ __html: iframe }} />
        </div>
        <div style={{ width: '60%', marginTop: '3vh' }}>
            <h2>How to master</h2>
            {svgFiles && svgFiles.length > 0 ? (
              <div>
                {svgFiles.map((filename) => (
                  <div key={filename} style={{ marginTop: '2vh' }}>
                    <CardWithText
                      filename={filename}
                      text={
                          filename === 'Delete.svg'
                          ? 'Remove iframe from product'
                          : filename === 'Upload.svg'
                          ? 'Upload new iframe.'
                          : ''
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p>No SVG files found.</p>
            )}
          </div>
        </div>
        <Form method="POST" encType="multipart/form-data">
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <input type="text" name="productId" value={productId} hidden readOnly />
            <input type="text" name="iframe" value={iframe} hidden readOnly />
            
            <button onClick={toggleActive} class="SaveButton" type="submit">Save</button>
            {toastMarkup}
        </div>
          </Form>
      </Card>
    </Page>
    </Frame>
  );
}