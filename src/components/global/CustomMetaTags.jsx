// Importing the Helmet component from the "react-helmet-async" library for managing meta tags in React applications.
import { Helmet } from "react-helmet-async";
// Importing the PropTypes library for defining and validating the props passed to the component.
import PropTypes from "prop-types";
// Importing a default image from the assets directory to use as a fallback for the Open Graph image.
import img from "@/assets/featuredImg.png";

/**
 * CustomMetaTag Component
 *
 * This component dynamically sets meta tags for a webpage using the Helmet component.
 * It is primarily designed to support SEO and Open Graph (OG) metadata, ensuring
 * the page appears correctly when shared on social platforms and for search engines.
 *
 * @param {string} title - The title of the page. Defaults to "English Healer" if not provided.
 * @param {string} image - The URL of the image to be used for Open Graph sharing. Defaults to a local image.
 * @param {string} description - The description of the page content. Defaults to an empty string if not provided.
 * @returns {JSX.Element} A Helmet component that sets the meta tags.
 */
const CustomMetaTag = ({ title, image, description }) => {
  return (
    // Helmet component for dynamically adding meta tags to the document head.
    <Helmet prioritizeSeoTags>
      {/* Set the page title dynamically. Includes "English Healer" as a prefix. */}
      <title>{title ? `Aims Purefied | ${title}` : "English Healer"}</title>

      {/* Open Graph meta tags for better integration with social media platforms */}
      <meta
        property="og:title"
        content={title ? `${title}` : "English Healer"}
      />
      <meta property="og:site_name" content="English Healer" />
      <meta property="og:type" content="website" />

      {/* Set the Open Graph image dynamically, with a fallback to a default image */}
      <meta property="og:image" content={image ? `${image}` : `${img}`} />

      {/* Dynamically sets the page URL using the current window location */}
      <meta property="og:url" content={window.location.href} />

      {/* Sets the Open Graph description dynamically */}
      <meta
        property="og:description"
        content={description ? `${description}` : ""}
      />

      {/* Meta tag for specifying the author of the content */}
      <meta name="author" content="Farhan Sadiq" />

      {/* Meta tag for specifying the copyright holder */}
      <meta name="copyright" content="English Healer" />
    </Helmet>
  );
};

// Define the types of props expected by the CustomMetaTag component using PropTypes.
// This ensures that the props passed to the component meet the required format.
CustomMetaTag.propTypes = {
  /**
   * The title of the page (string).
   * This is used to set the page title and Open Graph title.
   */
  title: PropTypes.string,

  /**
   * The URL of the image to be used in Open Graph sharing (string).
   * If not provided, a default image will be used.
   */
  image: PropTypes.string,

  /**
   * A brief description of the page content (string).
   * This is used in the Open Graph description.
   */
  description: PropTypes.string,
};

// Exporting the CustomMetaTag component for use in other parts of the application.
export default CustomMetaTag;
