import "./searchPage.css";
import Gallery from "../../components/gallery/gallery";
import { useSearchParams } from "react-router";

const SearchPage = () => {
  let [searchParams] = useSearchParams();

  const search = searchParams.get("search");
  const boardId = searchParams.get("boardId");

  return <Gallery search={search} boardId={boardId} />;
};

export default SearchPage;
