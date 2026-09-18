use futures::stream::Stream;
use std::pin::Pin;
use std::task::{Context, Poll};

use crate::{SorobanEvent, SentinelError};

/// A real-time stream of Soroban events from a WebSocket subscription.
///
/// Implements [`futures::Stream`] — iterate with
/// [`StreamExt::next`](futures::StreamExt::next).
///
/// Terminates cleanly when dropped: the underlying WebSocket connection is
/// closed as soon as the `Subscription` is dropped.
pub struct Subscription {
    inner: Pin<Box<dyn Stream<Item = Result<SorobanEvent, SentinelError>> + Send>>,
}

impl Subscription {
    pub(crate) fn new(
        stream: impl Stream<Item = Result<SorobanEvent, SentinelError>> + Send + 'static,
    ) -> Self {
        Subscription {
            inner: Box::pin(stream),
        }
    }
}

impl Stream for Subscription {
    type Item = Result<SorobanEvent, SentinelError>;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        use futures::StreamExt;
        self.inner.poll_next_unpin(cx)
    }
}
