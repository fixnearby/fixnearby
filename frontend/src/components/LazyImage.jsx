import { useState, useRef, useEffect } from 'react'

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    const currentRef = imgRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  return (
    <div ref={imgRef} className={className}>
      {inView && !error && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            opacity: loaded ? 1 : 0.7,
            transition: 'opacity 0.3s ease'
          }}
          {...props}
        />
      )}
      {error && (
        <div className="bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
          Image failed to load
        </div>
      )}
    </div>
  )
}

export default LazyImage