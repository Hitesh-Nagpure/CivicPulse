import React, { useState } from 'react';
import { 
  Upload, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  X, 
  Copy, 
  ExternalLink,
  FileText
} from 'lucide-react';

const CATEGORIES = [
  'Pothole & Road Damage',
  'Garbage & Waste Disposal',
  'Water Supply & Leakage',
  'Streetlight & Electrical',
  'Sewage & Drainage Overflow',
  'Public Sanitation & Hygiene',
  'Illegal Encroachment',
  'Parks & Public Property',
  'Other Civic Hazard',
];

const WARDS = [
  'Ward 1 - North Downtown',
  'Ward 2 - Tech Park Zone',
  'Ward 3 - Railway Colony',
  'Ward 4 - Green Valley',
  'Ward 5 - Sector 5 Gardens',
  'Ward 7 - Civil Lines',
  'Ward 9 - Riverside Heights',
  'Ward 12 - Old City Market',
  'Ward 14 - Highway Corridor',
  'General Municipal Area',
];

export default function ReportComplaint({ onComplaintCreated, onTrackRequest, currentUser }) {
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  // Location State (Default is Manual as required)
  const [locationMode, setLocationMode] = useState('manual');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [ward, setWard] = useState(currentUser?.ward || WARDS[3]);
  const [coords, setCoords] = useState({ latitude: null, longitude: null, accuracy: null });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');

  // Media State (Photo or Video)
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('none');

  // Citizen Info (Optional - No login needed!)
  const [citizenName, setCitizenName] = useState(currentUser?.name || '');
  const [citizenEmail, setCitizenEmail] = useState(currentUser?.email || '');
  const [citizenPhone, setCitizenPhone] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Reverse Geocoding: Converts GPS (lat, lng) into human-readable place name!
  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          // Format a clean, human-readable address
          const addr = data.address || {};
          const placeParts = [];
          if (addr.road || addr.street) placeParts.push(addr.road || addr.street);
          if (addr.suburb || addr.neighbourhood) placeParts.push(addr.suburb || addr.neighbourhood);
          if (addr.city || addr.town || addr.county) placeParts.push(addr.city || addr.town || addr.county);
          if (addr.postcode) placeParts.push(addr.postcode);

          const readablePlace = placeParts.length > 0 ? placeParts.join(', ') : data.display_name.split(',').slice(0, 3).join(',');
          return readablePlace;
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding fetch failed, using fallback:', err);
    }
    return null;
  };

  // GPS Geolocation Handler with Place Name Resolution
  const handleFetchGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsMessage('Detecting GPS location and fetching place name...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude, accuracy: Math.round(accuracy) });
        setLocationMode('gps');

        // Reverse geocode to get actual place name
        const placeName = await reverseGeocode(latitude, longitude);

        if (placeName) {
          setAddress(placeName);
          setGpsMessage(`✓ Location resolved: ${placeName}`);
        } else {
          // Clean fallback if offline
          setAddress(`Near Sector 4, Civic Area (GPS ±${Math.round(accuracy)}m)`);
          setGpsMessage('GPS acquired. You can adjust the location name if needed.');
        }

        setGpsLoading(false);
      },
      (error) => {
        setGpsLoading(false);
        setGpsMessage('Could not acquire GPS. Please type the location manually.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Media File Handler
  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB limit.');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    setMediaFile(file);
    setMediaType(isVideo ? 'video' : 'photo');

    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const removeMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType('none');
  };

  // Form Submit (AI assigns priority in background without showing to user)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a brief complaint title.');
      return;
    }
    if (!description.trim()) {
      alert('Please provide a description of the civic problem.');
      return;
    }
    if (!address.trim()) {
      alert('Please specify the location address or landmark.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('locationType', locationMode);
      formData.append('address', address.trim());
      formData.append('landmark', landmark.trim());
      formData.append('ward', ward);

      if (coords.latitude && coords.longitude) {
        formData.append('latitude', coords.latitude);
        formData.append('longitude', coords.longitude);
        formData.append('accuracy', coords.accuracy || 0);
      }

      if (mediaFile) {
        formData.append('mediaFile', mediaFile);
      }

      const senderName = citizenName.trim() || currentUser?.name || 'Civic Watcher';
      const senderEmail = citizenEmail.trim() || currentUser?.email || '';
      formData.append('citizenName', senderName);
      if (senderEmail) formData.append('citizenEmail', senderEmail);
      if (citizenPhone.trim()) formData.append('citizenPhone', citizenPhone.trim());

      const res = await fetch('/api/complaints', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit complaint.');
      }

      setCreatedComplaint(data.complaint);
      if (onComplaintCreated) onComplaintCreated(data.complaint);

      // Save tracking ID in localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('my_complaints') || '[]');
        stored.unshift({
          trackingId: data.complaint.trackingId,
          title: data.complaint.title,
          createdAt: new Date().toISOString(),
          status: data.complaint.status,
        });
        localStorage.setItem('my_complaints', JSON.stringify(stored.slice(0, 10)));
      } catch (e) {}

    } catch (err) {
      alert(err.message || 'Error lodging complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingId = () => {
    if (createdComplaint?.trackingId) {
      navigator.clipboard.writeText(createdComplaint.trackingId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(CATEGORIES[0]);
    setLocationMode('manual');
    setAddress('');
    setLandmark('');
    setCoords({ latitude: null, longitude: null, accuracy: null });
    setGpsMessage('');
    removeMedia();
    setCreatedComplaint(null);
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Clean Header */}
      <div className="page-hero" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-hero-title">Report a Civic Grievance</h1>
        <p className="page-hero-desc">
          No login required to raise a complaint. Submit details below to get an official tracking code.
        </p>
      </div>

      {/* Clean Single Form Card */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="complaint-title">
              <span>Issue Title *</span>
            </label>
            <input
              id="complaint-title"
              type="text"
              className="form-input"
              placeholder="e.g. Deep pothole causing accidents near School Gate 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="complaint-category">
              <span>Civic Category *</span>
            </label>
            <select
              id="complaint-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="complaint-desc">
              <span>Description & Impact *</span>
            </label>
            <textarea
              id="complaint-desc"
              className="form-textarea"
              placeholder="Describe the issue, location details, danger to vehicles or pedestrians..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Media Upload: Photo or Video */}
          <div className="form-group">
            <label className="form-label">
              <span>Upload Photo or Video Evidence</span>
              <span className="form-label-hint">JPG, PNG, MP4 (Max 50MB)</span>
            </label>

            {mediaPreview ? (
              <div className="media-preview-box">
                {mediaType === 'video' ? (
                  <video src={mediaPreview} controls className="media-preview-video" />
                ) : (
                  <img src={mediaPreview} alt="Complaint Preview" className="media-preview-img" />
                )}
                <button
                  type="button"
                  className="media-remove-btn"
                  onClick={removeMedia}
                  title="Remove media"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="dropzone-container" htmlFor="media-upload-input">
                <input
                  id="media-upload-input"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  style={{ display: 'none' }}
                />
                <div className="dropzone-icon">
                  <Upload size={20} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Click to Upload Photo or Video Proof
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Visual proof helps municipal workers resolve the problem faster
                </div>
              </label>
            )}
          </div>

          {/* Location Section */}
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.92rem' }}>
                <MapPin size={17} color="var(--primary)" />
                <span>Incident Location</span>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  className={`btn ${locationMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                  onClick={() => setLocationMode('manual')}
                >
                  Manual Address (Default)
                </button>

                <button
                  type="button"
                  className={`btn ${locationMode === 'gps' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                  onClick={handleFetchGpsLocation}
                  disabled={gpsLoading}
                >
                  <Navigation size={13} />
                  <span>{gpsLoading ? 'Locating Place...' : 'Fetch via GPS'}</span>
                </button>
              </div>
            </div>

            {gpsMessage && (
              <div style={{ fontSize: '0.8rem', color: gpsMessage.startsWith('✓') ? '#16a34a' : 'var(--text-secondary)', marginBottom: '0.65rem', fontWeight: 500 }}>
                {gpsMessage}
              </div>
            )}

            {/* Address */}
            <div className="form-group" style={{ marginBottom: '0.65rem' }}>
              <label className="form-label" htmlFor="complaint-address">
                <span>Place Name / Street Address *</span>
              </label>
              <input
                id="complaint-address"
                type="text"
                className="form-input"
                placeholder="e.g. MG Road, Near Metro Pillar 140"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="complaint-landmark">Landmark (Optional)</label>
                <input
                  id="complaint-landmark"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Opposite State Bank ATM"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="complaint-ward">Municipal Ward</label>
                <select
                  id="complaint-ward"
                  className="form-select"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                >
                  {WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Citizen Details (Optional - No Login Needed) */}
          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Citizen Contact (Optional)
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Leave blank to report anonymously, or provide your email to earn points on the Civic Leaderboard.
            </div>

            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your Name (Optional)"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Your Email (Optional)"
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="submit-complaint-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.98rem' }}
            disabled={submitting}
          >
            {submitting ? 'Lodging Complaint...' : 'Submit Civic Complaint'}
          </button>
        </form>
      </div>

      {/* Clean Success Modal */}
      {createdComplaint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <CheckCircle2 size={30} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Complaint Registered!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Your grievance has been submitted to the municipal authority.
            </p>

            {/* Tracking ID Box */}
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Your Tracking Code
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)', margin: '0.2rem 0' }}>
                {createdComplaint.trackingId}
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
                onClick={copyTrackingId}
              >
                <Copy size={13} />
                <span>{copySuccess ? 'Copied!' : 'Copy Tracking Code'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={resetForm}
              >
                Report Another
              </button>

              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  const id = createdComplaint.trackingId;
                  resetForm();
                  if (onTrackRequest) onTrackRequest(id);
                }}
              >
                <ExternalLink size={15} />
                <span>Track Progress</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
