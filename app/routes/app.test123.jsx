import {
    Page,
    Card,
  } from "@shopify/polaris";

export const loader = async ({ request }) => {

  return true
};

export default function App() {

  return (
      <Page>
          <Card>
              <iframe src="https://spinzam.com/mypage/" ></iframe>
          </Card>
    </Page>
  );
}
