import ContentPanel from "../components/content-panel";
import Navbar from "../components/navbar";
import ReaderPage from "../components/reader-page";

export default function Home() {
  return (
    <>
      <Navbar></Navbar>
      <ContentPanel>
        <ReaderPage />
      </ContentPanel>
    </>
  );
}
