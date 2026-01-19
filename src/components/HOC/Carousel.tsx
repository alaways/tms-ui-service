import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import 'react-18-image-lightbox/style.css';
import Lightbox from 'react-18-image-lightbox';

const Carousel = ({ items }: any) => {
  const [photoIndex, setPhotoIndex] = useState(-1); // Index of the photo to be displayed in lightbox
  const [isOpen, setIsOpen] = useState(false);
  const filteredItems = items.filter((item: any) => item.image_url && item.image_url.includes('http'));

  const handleClick = (index: any) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  useEffect(() => {
    window['global'] = window as never;
  }, []);

  return (
    <>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={{ nextEl: '.swiper-button-next-ex1', prevEl: '.swiper-button-prev-ex1' }}
        pagination={{ clickable: true }}
        className="swiper max-w-3xl mx-auto mb-5 !z-0 flex items-center"
        id="slider1"
      >
        <div className="swiper-wrapper">
          {filteredItems.map((item: any, i: number) => (
            <SwiperSlide key={i}>
              <img src={`${item.image_url}`} className="w-full max-h-80 object-contain" alt="itemImage" onClick={() => handleClick(i)} />
            </SwiperSlide>
          ))}
        </div>
        <button className="swiper-button-prev-ex1 grid place-content-center ltr:left-2 rtl:right-2 p-1 transition text-primary hover:text-white border border-primary hover:border-primary hover:bg-primary rounded-full absolute z-[999] top-1/2 -translate-y-1/2">
          <IconCaretDown className="w-5 h-5 rtl:-rotate-90 rotate-90" />
        </button>
        <button className="swiper-button-next-ex1 grid place-content-center ltr:right-2 rtl:left-2 p-1 transition text-primary hover:text-white border border-primary hover:border-primary hover:bg-primary rounded-full absolute z-[999] top-1/2 -translate-y-1/2">
          <IconCaretDown className="w-5 h-5 rtl:rotate-90 -rotate-90" />
        </button>
      </Swiper>
      {isOpen && (
        <Lightbox
          mainSrc={filteredItems[photoIndex].image_url}
          nextSrc={filteredItems[(photoIndex + 1) % filteredItems.length].image_url}
          prevSrc={filteredItems[(photoIndex + filteredItems.length - 1) % filteredItems.length].image_url}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex((photoIndex + filteredItems.length - 1) % filteredItems.length)
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % filteredItems.length)
          }
        />
      )}
    </>

  );
};

export default Carousel;