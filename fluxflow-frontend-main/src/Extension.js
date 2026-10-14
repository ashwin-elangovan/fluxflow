import React from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { connect } from 'react-redux';

const WIDTH = 620;
const HEIGHT = 500;
const BASE_SCALE = 218;

class GlobeView extends React.Component {
    state = { locationPage: 0 };
    svgRef = React.createRef();
    tooltipRef = React.createRef();
    projection = d3.geoOrthographic().translate([WIDTH / 2, HEIGHT / 2]).scale(BASE_SCALE).clipAngle(90).precision(.25);
    rotation = [-20, -18, 0];
    zoom = 1;
    countries = null;
    selectedLocation = null;
    locations = [];
    rotationFrame = null;

    componentDidMount() {
        d3.json('./data/extensionData/ne_50m_admin_0_countries.json').then(data => {
            this.countries = topojson.feature(data, data.objects.ne_50m_admin_0_countries);
            this.draw();
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.mdsArr !== this.props.mdsArr || prevProps.fullTweets !== this.props.fullTweets) {
            this.locations = this.getLocations();
            this.selectedLocation = this.locations.find(place => place.name === this.selectedLocation?.name) || null;
            this.draw();
        }
    }

    componentWillUnmount() {
        this.cancelRotation();
        d3.select(this.svgRef.current).on('.drag', null).on('.zoom', null);
    }

    cancelRotation = () => {
        if (this.rotationFrame !== null) cancelAnimationFrame(this.rotationFrame);
        this.rotationFrame = null;
    };

    getLocations = () => {
        const tweets = this.props.fullTweets[0] || {};
        const locations = new Map();
        this.props.mdsArr.forEach(topic => (topic.childrens || []).forEach(id => {
            const post = tweets[id];
            const latitude = Number(post?.latitude);
            const longitude = Number(post?.longitude);
            if (!post?.location || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
            const current = locations.get(post.location) || { name: post.location, latitude, longitude, count: 0, posts: [] };
            current.count += 1;
            current.posts.push(post);
            locations.set(post.location, current);
        }));
        return [...locations.values()].sort((a, b) => b.count - a.count);
    };

    resetGlobe = () => {
        this.cancelRotation();
        this.rotation = [-20, -18, 0];
        this.zoom = 1;
        this.selectedLocation = null;
        this.setState({ locationPage: 0 });
        this.draw();
    };

    changeZoom = direction => {
        this.cancelRotation();
        this.zoom = Math.max(.8, Math.min(2.2, this.zoom + direction * .2));
        this.draw();
        this.forceUpdate();
    };

    focusLocation = location => {
        this.cancelRotation();
        this.selectedLocation = location;
        this.setState({ locationPage: 0 });

        const target = [location.longitude, location.latitude];
        const currentCenter = [-this.rotation[0], -this.rotation[1]];
        const interpolateCenter = d3.geoInterpolate(currentCenter, target);
        const startRoll = this.rotation[2] || 0;
        const angularDistance = d3.geoDistance(currentCenter, target);
        const duration = Math.max(520, Math.min(1100, 520 + angularDistance * 260));
        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        if (reducedMotion || angularDistance < .002) {
            this.rotation = [-location.longitude, -location.latitude, 0];
            this.draw();
            return;
        }

        const startedAt = performance.now();
        const animate = now => {
            const progress = Math.min(1, (now - startedAt) / duration);
            const eased = d3.easeCubicInOut(progress);
            const [longitude, latitude] = interpolateCenter(eased);
            this.rotation = [-longitude, -latitude, startRoll * (1 - eased)];
            this.draw();
            if (progress < 1) this.rotationFrame = requestAnimationFrame(animate);
            else {
                this.rotation = [-location.longitude, -location.latitude, 0];
                this.rotationFrame = null;
                this.draw();
            }
        };
        this.rotationFrame = requestAnimationFrame(animate);
    };

    showTooltip = (event, location) => {
        const bounds = this.svgRef.current.getBoundingClientRect();
        d3.select(this.tooltipRef.current)
            .html(`<strong>${location.name}</strong><span>${location.count} ${location.count === 1 ? 'post' : 'posts'} in selection</span><small>Click to center</small>`)
            .style('visibility', 'visible')
            .style('left', `${Math.min(event.clientX - bounds.left + 16, bounds.width - 190)}px`)
            .style('top', `${Math.max(10, event.clientY - bounds.top - 22)}px`);
    };

    hideTooltip = () => d3.select(this.tooltipRef.current).style('visibility', 'hidden');

    draw = () => {
        if (!this.countries || !this.svgRef.current) return;
        const projection = this.projection.rotate(this.rotation).scale(BASE_SCALE * this.zoom);
        const path = d3.geoPath(projection);
        const svg = d3.select(this.svgRef.current);
        svg.selectAll('*').remove();

        const surface = svg.append('g');
        surface.append('path').datum({ type: 'Sphere' }).attr('class', 'globe-ocean').attr('d', path);
        surface.append('path').datum(d3.geoGraticule10()).attr('class', 'globe-graticule').attr('d', path);
        surface.append('path').datum(this.countries).attr('class', 'globe-countries').attr('d', path);

        const visible = this.locations.filter(location => d3.geoDistance(
            [location.longitude, location.latitude], [-projection.rotate()[0], -projection.rotate()[1]]
        ) < Math.PI / 2);
        const radius = d3.scaleSqrt().domain([1, Math.max(1, ...this.locations.map(place => place.count))]).range([7, 18]);
        const markers = svg.append('g').selectAll('g').data(visible, place => place.name).join('g')
            .attr('class', place => `globe-marker ${place.name === this.selectedLocation?.name ? 'is-active' : ''}`)
            .attr('transform', place => `translate(${projection([place.longitude, place.latitude])})`)
            .attr('role', 'button').attr('tabindex', 0)
            .attr('aria-label', place => `${place.name}, ${place.count} ${place.count === 1 ? 'post' : 'posts'}. Center location.`)
            .on('mouseenter focus', this.showTooltip).on('mousemove', this.showTooltip)
            .on('mouseleave blur', this.hideTooltip)
            .on('click', (event, place) => this.focusLocation(place))
            .on('keydown', (event, place) => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.focusLocation(place); }
            });
        markers.append('circle').attr('class', 'marker-pulse').attr('r', place => radius(place.count) + 6);
        markers.append('circle').attr('class', 'marker-core').attr('r', place => radius(place.count));
        markers.append('text').attr('class', 'marker-count').attr('text-anchor', 'middle').attr('dy', '.35em').text(place => place.count);

        const drag = d3.drag()
            .on('start', event => {
                this.cancelRotation();
                this.dragStart = { x: event.x, y: event.y, rotation: [...this.rotation] };
                svg.classed('is-dragging', true);
            })
            .on('drag', event => {
                const sensitivity = 90 / (BASE_SCALE * this.zoom);
                this.rotation = [
                    this.dragStart.rotation[0] + (event.x - this.dragStart.x) * sensitivity,
                    Math.max(-80, Math.min(80, this.dragStart.rotation[1] - (event.y - this.dragStart.y) * sensitivity)), 0
                ];
                this.selectedLocation = null;
                this.draw();
            })
            .on('end', () => { svg.classed('is-dragging', false); this.forceUpdate(); });
        svg.call(drag).on('wheel.zoom', event => {
            event.preventDefault();
            this.cancelRotation();
            this.zoom = Math.max(.8, Math.min(2.2, this.zoom + (event.deltaY < 0 ? .12 : -.12)));
            this.draw();
            this.forceUpdate();
        }, { passive: false });
    };

    render() {
        this.locations = this.getLocations();
        const totalPosts = this.locations.reduce((sum, place) => sum + place.count, 0);
        const topLocations = this.locations.slice(0, 7);
        const locationPosts = [...(this.selectedLocation?.posts || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const pageCount = Math.max(1, Math.ceil(locationPosts.length / 10));
        const page = Math.min(this.state.locationPage, pageCount - 1);
        const visiblePosts = locationPosts.slice(page * 10, page * 10 + 10);
        return (
            <div className="globe-layout">
                <div className="globe-stage">
                    <div className="globe-tools">
                        <div className="globe-stats"><b>{this.locations.length || '—'}</b><span>places</span><b>{totalPosts || '—'}</b><span>located posts</span></div>
                        <div className="globe-actions" aria-label="Globe controls">
                            <button type="button" onClick={() => this.changeZoom(-1)} aria-label="Zoom out">−</button>
                            <span>{Math.round(this.zoom * 100)}%</span>
                            <button type="button" onClick={() => this.changeZoom(1)} aria-label="Zoom in">+</button>
                            <button type="button" className="reset-button" onClick={this.resetGlobe}>Reset</button>
                        </div>
                    </div>
                    <div id="world" className={!this.locations.length ? 'is-empty' : ''}>
                        <svg ref={this.svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="group" aria-label="Interactive globe showing locations from selected topics" />
                        <div ref={this.tooltipRef} className="globe-tooltip" aria-live="polite" />
                        {!this.locations.length && <div className="globe-empty"><span>03</span><strong>No places to map yet</strong><p>Select a topic with location data to reveal where its posts came from.</p><a href="#topic-space">Choose a topic ↑</a></div>}
                        {!!this.locations.length && <span className="globe-hint">Drag to rotate · scroll or use + / − to zoom</span>}
                    </div>
                </div>
                <aside className="location-panel">
                    <div className="location-panel-head"><span className="mini-label">Location ranking</span><small>Click a place to center it</small></div>
                    {topLocations.length ? <ol>{topLocations.map((location, index) => (
                        <li key={location.name} className={location.name === this.selectedLocation?.name ? 'is-active' : ''}>
                            <button type="button" onClick={() => this.focusLocation(location)}>
                                <i>{String(index + 1).padStart(2, '0')}</i>
                                <span><b>{location.name}</b><em style={{ width: `${(location.count / topLocations[0].count) * 100}%` }} /></span>
                                <strong>{location.count}<small> posts</small></strong>
                            </button>
                        </li>
                    ))}</ol> : <div className="inline-empty"><b>Waiting for a selection</b><span>Locations will be ranked here after you choose a topic.</span></div>}
                </aside>
                {this.selectedLocation && <section className="location-results" aria-labelledby="location-posts-title">
                    <header className="location-results-head">
                        <div className="active-place"><span>Centered on</span><strong>{this.selectedLocation.name}</strong><p>{this.selectedLocation.count} of {totalPosts} located posts</p></div>
                        <div className="location-feed-head"><div><span className="mini-label">Location detail</span><b id="location-posts-title">Posts from this place</b></div><small>{page * 10 + 1}–{Math.min((page + 1) * 10, locationPosts.length)} of {locationPosts.length}</small></div>
                    </header>
                    <div className="location-feed">
                        {visiblePosts.map(post => <article key={post.tweet_id}>
                            <p>{post.content}</p>
                            <footer><time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</time><span>{Number(post.favorite_count || 0) + Number(post.retweet_count || 0)} engagements</span></footer>
                        </article>)}
                    </div>
                    {pageCount > 1 && <nav className="location-pagination" aria-label="Location post pages">
                        <button type="button" disabled={page === 0} onClick={() => this.setState({ locationPage: page - 1 })}>← Previous</button>
                        <span>{page + 1} / {pageCount}</span>
                        <button type="button" disabled={page === pageCount - 1} onClick={() => this.setState({ locationPage: page + 1 })}>Next →</button>
                    </nav>}
                </section>}
            </div>
        );
    }
}

const mapStateToProps = state => ({ mdsArr: state.reducer.mdsArr, fullTweets: state.reducer.fullTweets });
export default connect(mapStateToProps)(GlobeView);
