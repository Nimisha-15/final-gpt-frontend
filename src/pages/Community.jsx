import React, { useEffect, useState } from "react";
import { dummyPublishedImages } from "../assets/assets";
import Loading from "./Loading";
import { useAppContext } from "../context/AppContext";

const Community = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios } = useAppContext();

  const fetchImages = async (params) => {
    try {
      const { data } = await axios.get("/api/user/published-images");
      if (data.success) {
        setImages(data.images);
      } else {
        toast.error(data.messsage);
      }
    } catch (error) {
      toast.error(error.messsage);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);
  if (loading) return <Loading />;

  return (
    <div className="p-9 pt-12 xl:px-12 2xl-px-15 w-full  h-full overflow-y-scroll">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-cyan-50 ">
        Created Images
      </h2>
      {images.length > 0 ? (
        <div className="flex flex-wrap max-sm:justify-center gap-5">
          {images.map((item, index) => {
            return (
              <a
                key={index}
                href={item.imageUrl}
                target="_blank"
                className="relative group block rounded-lg overflow-hidden border border-gray-200 dark:border-cyan-700 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-full h-40 md:h-50 2xl:h-62 object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                />
              </a>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-600 drak:text-cyan-200 mt-10 ">
          No Images Available{" "}
        </p>
      )}
    </div>
  );
};

export default Community;
