import React from 'react';
import { Button } from 'react-bootstrap';

/**
 * Social Share Component
 * Provides buttons to share content on various social media platforms
 */
const SocialShare = ({ url, title, description }) => {
  // Use current URL if not provided
  const shareUrl = url || window.location.href;
  const shareTitle = encodeURIComponent(title || 'Check out this course!');
  const shareDescription = encodeURIComponent(description || '');

  const handleShare = (platform) => {
    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${shareTitle}%20${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${shareTitle}&body=${shareDescription}%20${encodeURIComponent(shareUrl)}`;
        break;
      default:
        return;
    }

    // Open share link in new window (except email)
    if (platform === 'email') {
      window.location.href = shareLink;
    } else {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  // Check if Web Share API is available (mobile devices)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  return (
    <div className='social-share my-3'>
      <h5 className='mb-2'>Share this course:</h5>
      <div className='d-flex flex-wrap gap-2'>
        <Button
          variant='primary'
          size='sm'
          onClick={() => handleShare('facebook')}
          className='me-2 mb-2'
        >
          <i className='fab fa-facebook-f'></i> Facebook
        </Button>
        <Button
          variant='info'
          size='sm'
          onClick={() => handleShare('twitter')}
          className='me-2 mb-2'
        >
          <i className='fab fa-twitter'></i> Twitter
        </Button>
        <Button
          variant='success'
          size='sm'
          onClick={() => handleShare('whatsapp')}
          className='me-2 mb-2'
        >
          <i className='fab fa-whatsapp'></i> WhatsApp
        </Button>
        <Button
          variant='primary'
          size='sm'
          onClick={() => handleShare('linkedin')}
          className='me-2 mb-2'
          style={{ backgroundColor: '#0077b5', borderColor: '#0077b5' }}
        >
          <i className='fab fa-linkedin-in'></i> LinkedIn
        </Button>
        <Button
          variant='secondary'
          size='sm'
          onClick={() => handleShare('email')}
          className='me-2 mb-2'
        >
          <i className='fas fa-envelope'></i> Email
        </Button>
        {navigator.share && (
          <Button
            variant='dark'
            size='sm'
            onClick={handleNativeShare}
            className='mb-2'
          >
            <i className='fas fa-share-alt'></i> Share
          </Button>
        )}
      </div>
    </div>
  );
};

export default SocialShare;

